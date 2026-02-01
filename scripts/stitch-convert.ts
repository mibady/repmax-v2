#!/usr/bin/env npx tsx
/**
 * Stitch Convert Script
 *
 * Converts a single Stitch HTML file to a Next.js React component.
 * Preserves Material Symbols icons and Tailwind classes from Stitch output.
 *
 * Usage:
 *   npm run stitch:convert -- --input stitch-exports/landing.html --output app/page.tsx
 *   npm run stitch:convert -- --url <stitch-download-url> --output app/page.tsx
 *
 * Options:
 *   --input <path>   Path to local HTML file
 *   --url <url>      Stitch download URL (will attempt to fetch)
 *   --output <path>  Output path for the React component
 *   --name <name>    Component name (defaults to PascalCase of filename)
 *   --client         Add 'use client' directive (for components with hooks)
 *   --dry-run        Show output without writing file
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, basename, extname } from 'path';
import { JSDOM } from 'jsdom';

interface ConvertOptions {
  input?: string;
  url?: string;
  output: string;
  name?: string;
  client?: boolean;
  dryRun?: boolean;
}

function parseArgs(): ConvertOptions {
  const args = process.argv.slice(2);
  const options: ConvertOptions = { output: '' };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = args[++i];
        break;
      case '--url':
        options.url = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--name':
        options.name = args[++i];
        break;
      case '--client':
        options.client = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  return options;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase())
    .replace(/\.(html|tsx?)$/i, '');
}

function extractTailwindConfig(html: string): Record<string, unknown> | null {
  const configMatch = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/);
  if (configMatch) {
    try {
      // Use Function constructor to safely evaluate the config object
      const configStr = configMatch[1];
      return new Function(`return ${configStr}`)();
    } catch {
      return null;
    }
  }
  return null;
}

function extractCustomStyles(html: string): string[] {
  const styles: string[] = [];
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);

  if (styleMatch) {
    for (const style of styleMatch) {
      const content = style.replace(/<\/?style[^>]*>/gi, '').trim();
      // Filter out common Tailwind/reset styles, keep custom ones
      const customStyles = content
        .split(/\n/)
        .filter(line => {
          const trimmed = line.trim();
          return trimmed &&
                 !trimmed.startsWith('body') &&
                 !trimmed.startsWith('::-webkit') &&
                 !trimmed.startsWith('*') &&
                 trimmed.includes('{');
        })
        .join('\n');

      if (customStyles.trim()) {
        styles.push(customStyles);
      }
    }
  }

  return styles;
}

function convertHtmlToJsx(html: string): string {
  // Replace HTML attributes with React equivalents
  let jsx = html
    // HTML comments -> JSX comments
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
    // class -> className
    .replace(/\bclass=/g, 'className=')
    // for -> htmlFor
    .replace(/\bfor=/g, 'htmlFor=')
    // tabindex -> tabIndex
    .replace(/\btabindex=/gi, 'tabIndex=')
    // colspan -> colSpan
    .replace(/\bcolspan=/gi, 'colSpan=')
    // rowspan -> rowSpan
    .replace(/\browspan=/gi, 'rowSpan=')
    // autocomplete -> autoComplete
    .replace(/\bautocomplete=/gi, 'autoComplete=')
    // maxlength -> maxLength
    .replace(/\bmaxlength=/gi, 'maxLength=')
    // minlength -> minLength
    .replace(/\bminlength=/gi, 'minLength=')
    // Convert inline style strings to objects
    .replace(/style="([^"]*)"/g, (_, styleStr) => {
      const styleObj = styleStr
        .split(';')
        .filter((s: string) => s.trim())
        .map((s: string) => {
          const [prop, val] = s.split(':').map((p: string) => p.trim());
          if (!prop || !val) return null;
          // Convert CSS prop to camelCase
          const camelProp = prop.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
          // Handle numeric values
          const numericVal = val.match(/^-?[\d.]+$/) ? val : `"${val}"`;
          return `${camelProp}: ${numericVal}`;
        })
        .filter(Boolean)
        .join(', ');
      return `style={{${styleObj}}}`;
    })
    // Self-closing tags
    .replace(/<(img|input|br|hr|meta|link)([^>]*?)(?<!\/)>/gi, '<$1$2 />')
    // Boolean attributes
    .replace(/\b(disabled|checked|selected|required|readonly)(?=[\s>])/gi, '$1={true}')
    // Remove onclick and other inline handlers (will be replaced with React handlers)
    .replace(/\bon\w+="[^"]*"/gi, '')
    // Handle href="#" patterns
    .replace(/href="#"/g, 'href="/"')
    // Handle self-closing script tags
    .replace(/<script[^>]*><\/script>/gi, '')
    // Remove external scripts (Tailwind CDN, etc.)
    .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/gi, '')
    .replace(/<script[^>]*src="[^"]*"[^>]*\/>/gi, '');

  return jsx;
}

function extractBodyContent(html: string): string {
  const dom = new JSDOM(html);
  const body = dom.window.document.body;

  if (!body) {
    // Try to find body-like content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1].trim();
    }
    return html;
  }

  // Remove script tags from body
  body.querySelectorAll('script').forEach(s => s.remove());

  return body.innerHTML.trim();
}

function wrapInComponent(
  jsx: string,
  componentName: string,
  useClient: boolean,
  customStyles: string[]
): string {
  const clientDirective = useClient ? `'use client';\n\n` : '';

  const styleTag = customStyles.length > 0
    ? `\n{/* Custom styles from Stitch */}\n<style jsx>{\`\n${customStyles.join('\n')}\n\`}</style>`
    : '';

  // Detect if we need Link from next/link
  const needsLink = jsx.includes('href=');
  const linkImport = needsLink ? `import Link from 'next/link';\n` : '';

  // Detect if we need Image from next/image
  const needsImage = jsx.includes('<img');
  const imageImport = needsImage ? `import Image from 'next/image';\n` : '';

  const imports = [linkImport, imageImport].filter(Boolean).join('');

  // Convert <a> tags to <Link> where appropriate
  let processedJsx = jsx;
  if (needsLink) {
    processedJsx = processedJsx.replace(
      /<a(\s+[^>]*?)href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi,
      '<Link$1href="$2"$3>$4</Link>'
    );
  }

  return `${clientDirective}${imports}
export default function ${componentName}() {
  return (
    <>
      ${processedJsx}${styleTag}
    </>
  );
}
`;
}

async function fetchFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch from URL: ${error}`);
  }
}

async function main() {
  const options = parseArgs();

  if (!options.output) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  if (!options.input && !options.url) {
    console.error('Error: Either --input or --url is required');
    process.exit(1);
  }

  let html: string;

  if (options.input) {
    if (!existsSync(options.input)) {
      console.error(`Error: Input file not found: ${options.input}`);
      process.exit(1);
    }
    html = readFileSync(options.input, 'utf-8');
    console.log(`Reading from: ${options.input}`);
  } else if (options.url) {
    console.log(`Fetching from URL: ${options.url}`);
    html = await fetchFromUrl(options.url);
  } else {
    console.error('Error: No input source specified');
    process.exit(1);
  }

  // Extract Tailwind config for reference
  const tailwindConfig = extractTailwindConfig(html);
  if (tailwindConfig) {
    console.log('Found Tailwind config with custom colors/theme');
  }

  // Extract custom styles
  const customStyles = extractCustomStyles(html);
  if (customStyles.length > 0) {
    console.log(`Found ${customStyles.length} custom style block(s)`);
  }

  // Extract body content
  const bodyContent = extractBodyContent(html);

  // Convert HTML to JSX
  const jsx = convertHtmlToJsx(bodyContent);

  // Determine component name
  const componentName = options.name || toPascalCase(basename(options.output));

  // Wrap in component
  const component = wrapInComponent(jsx, componentName, options.client || false, customStyles);

  if (options.dryRun) {
    console.log('\n--- DRY RUN OUTPUT ---\n');
    console.log(component.substring(0, 2000));
    if (component.length > 2000) {
      console.log(`\n... (${component.length - 2000} more characters)`);
    }
    console.log('\n--- END DRY RUN ---');
  } else {
    // Ensure output directory exists
    const outputDir = dirname(options.output);
    if (outputDir && !existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(options.output, component);
    console.log(`\nWritten to: ${options.output}`);
    console.log(`Component name: ${componentName}`);
    console.log(`Lines: ${component.split('\n').length}`);
  }

  // Output Tailwind theme additions needed
  if (tailwindConfig?.theme?.extend?.colors) {
    console.log('\nTailwind theme colors needed:');
    console.log(JSON.stringify(tailwindConfig.theme.extend.colors, null, 2));
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
