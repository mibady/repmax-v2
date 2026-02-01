#!/usr/bin/env npx tsx
/**
 * Stitch Batch Conversion Script
 *
 * Batch converts all Stitch HTML files from a screens manifest to Next.js React components.
 * Reads from screens.json or sprint-*-screens.json and converts all screens.
 *
 * Usage:
 *   npm run stitch:batch -- --screens stitch-exports/screens.json --output ./apps/web/app
 *   npm run stitch:batch -- --screens stitch-exports/sprint-2b-screens.json --output ./apps/web
 *   npm run stitch:batch -- --dir stitch-exports/ --output ./apps/web/app
 *
 * Options:
 *   --screens <path>    Path to screens manifest JSON
 *   --dir <path>        Directory containing HTML files to convert
 *   --output <path>     Base output directory for converted components
 *   --project <name>    Project name for manifest
 *   --skip-no-html      Skip screens without local HTML files
 *   --dry-run           Show what would be converted without writing files
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { dirname, basename, join, extname } from 'path';
import { JSDOM } from 'jsdom';

interface ScreenEntry {
  id: string;
  title: string;
  file?: string;
  htmlUrl?: string;
  output: string;
  route?: string;
  dataRequirements?: string[];
}

interface ScreensManifest {
  projectId: string;
  sprint?: string;
  exportDate: string;
  screens: ScreenEntry[] | Record<string, ScreenEntry[]>;
}

interface ConversionResult {
  screen: string;
  input: string;
  output: string;
  success: boolean;
  error?: string;
  linesWritten?: number;
}

interface BatchOptions {
  screens?: string;
  dir?: string;
  output: string;
  project?: string;
  skipNoHtml?: boolean;
  dryRun?: boolean;
}

function parseArgs(): BatchOptions {
  const args = process.argv.slice(2);
  const options: BatchOptions = { output: './app' };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--screens':
        options.screens = args[++i];
        break;
      case '--dir':
        options.dir = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--project':
        options.project = args[++i];
        break;
      case '--skip-no-html':
        options.skipNoHtml = true;
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

function extractBodyContent(html: string): string {
  try {
    const dom = new JSDOM(html);
    const body = dom.window.document.body;

    if (body) {
      body.querySelectorAll('script').forEach(s => s.remove());
      return body.innerHTML.trim();
    }
  } catch {
    // Fallback to regex
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }
  return html;
}

function extractCustomStyles(html: string): string[] {
  const styles: string[] = [];
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);

  if (styleMatch) {
    for (const style of styleMatch) {
      const content = style.replace(/<\/?style[^>]*>/gi, '').trim();
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
  let jsx = html
    // HTML comments -> JSX comments
    .replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}')
    .replace(/\bclass=/g, 'className=')
    .replace(/\bfor=/g, 'htmlFor=')
    .replace(/\btabindex=/gi, 'tabIndex=')
    .replace(/\bcolspan=/gi, 'colSpan=')
    .replace(/\browspan=/gi, 'rowSpan=')
    .replace(/\bautocomplete=/gi, 'autoComplete=')
    .replace(/\bmaxlength=/gi, 'maxLength=')
    .replace(/\bminlength=/gi, 'minLength=')
    // Convert inline style strings to objects
    .replace(/style="([^"]*)"/g, (_, styleStr) => {
      const styleObj = styleStr
        .split(';')
        .filter((s: string) => s.trim())
        .map((s: string) => {
          const [prop, val] = s.split(':').map((p: string) => p.trim());
          if (!prop || !val) return null;
          const camelProp = prop.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
          const numericVal = val.match(/^-?[\d.]+$/) ? val : `"${val}"`;
          return `${camelProp}: ${numericVal}`;
        })
        .filter(Boolean)
        .join(', ');
      return `style={{${styleObj}}}`;
    })
    .replace(/<(img|input|br|hr|meta|link)([^>]*?)(?<!\/)>/gi, '<$1$2 />')
    .replace(/\b(disabled|checked|selected|required|readonly)(?=[\s>])/gi, '$1={true}')
    .replace(/\bon\w+="[^"]*"/gi, '')
    .replace(/href="#"/g, 'href="/"')
    .replace(/<script[^>]*><\/script>/gi, '')
    .replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/gi, '')
    .replace(/<script[^>]*src="[^"]*"[^>]*\/>/gi, '');

  return jsx;
}

function determineIfClientComponent(jsx: string): boolean {
  // Components that likely need interactivity
  return jsx.includes('onClick') ||
         jsx.includes('onChange') ||
         jsx.includes('onSubmit') ||
         jsx.includes('<form') ||
         jsx.includes('<input') ||
         jsx.includes('<select') ||
         jsx.includes('<button');
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

  const needsLink = jsx.includes('href=');
  const linkImport = needsLink ? `import Link from 'next/link';\n` : '';

  const needsImage = jsx.includes('<img');
  const imageImport = needsImage ? `import Image from 'next/image';\n` : '';

  const imports = [linkImport, imageImport].filter(Boolean).join('');

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

function convertScreen(inputPath: string, outputPath: string, title: string): ConversionResult {
  const result: ConversionResult = {
    screen: title,
    input: inputPath,
    output: outputPath,
    success: false,
  };

  try {
    if (!existsSync(inputPath)) {
      result.error = 'Input file not found';
      return result;
    }

    const html = readFileSync(inputPath, 'utf-8');
    const bodyContent = extractBodyContent(html);
    const customStyles = extractCustomStyles(html);
    const jsx = convertHtmlToJsx(bodyContent);

    const componentName = toPascalCase(basename(outputPath));
    const useClient = determineIfClientComponent(jsx);

    const component = wrapInComponent(jsx, componentName, useClient, customStyles);

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(outputPath, component);

    result.success = true;
    result.linesWritten = component.split('\n').length;
  } catch (error: unknown) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

function flattenScreens(manifest: ScreensManifest): ScreenEntry[] {
  if (Array.isArray(manifest.screens)) {
    return manifest.screens;
  }

  // Handle nested structure like { auth: [...], dashboard: [...] }
  const screens: ScreenEntry[] = [];
  for (const category of Object.values(manifest.screens)) {
    if (Array.isArray(category)) {
      screens.push(...category);
    }
  }
  return screens;
}

function resolveOutputPath(screen: ScreenEntry, baseOutput: string): string {
  if (screen.output) {
    // If output starts with app/ or apps/, join with base
    if (screen.output.startsWith('app/') || screen.output.startsWith('apps/')) {
      return join(baseOutput, '..', screen.output);
    }
    // If output is a relative path
    return join(baseOutput, screen.output);
  }

  // Generate from route
  if (screen.route) {
    const routePath = screen.route
      .replace(/\[(\w+)\]/g, '[$1]') // Keep dynamic segments
      .replace(/^\//, ''); // Remove leading slash

    return join(baseOutput, routePath, 'page.tsx');
  }

  // Fallback: use title
  const slug = screen.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return join(baseOutput, slug, 'page.tsx');
}

function resolveInputPath(screen: ScreenEntry, baseDir: string): string | null {
  if (screen.file) {
    const inputPath = join(baseDir, screen.file);
    if (existsSync(inputPath)) {
      return inputPath;
    }
  }

  // Try to find by ID or title
  const possibleNames = [
    `${screen.id}.html`,
    `${screen.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`,
  ];

  for (const name of possibleNames) {
    const inputPath = join(baseDir, name);
    if (existsSync(inputPath)) {
      return inputPath;
    }
  }

  return null;
}

async function main() {
  const options = parseArgs();

  if (!options.screens && !options.dir) {
    console.error('Error: Either --screens or --dir is required');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('STITCH BATCH CONVERSION');
  console.log('='.repeat(60));

  const results: ConversionResult[] = [];
  let baseDir = 'stitch-exports';

  if (options.screens) {
    // Process from manifest
    if (!existsSync(options.screens)) {
      console.error(`Error: Screens manifest not found: ${options.screens}`);
      process.exit(1);
    }

    baseDir = dirname(options.screens);
    const manifest: ScreensManifest = JSON.parse(readFileSync(options.screens, 'utf-8'));
    const screens = flattenScreens(manifest);

    console.log(`\nProject: ${manifest.projectId}`);
    console.log(`Sprint: ${manifest.sprint || 'N/A'}`);
    console.log(`Total screens: ${screens.length}`);
    console.log(`Output base: ${options.output}`);
    console.log('');

    for (const screen of screens) {
      const inputPath = resolveInputPath(screen, baseDir);

      if (!inputPath) {
        if (options.skipNoHtml) {
          console.log(`⏭️  Skipping (no HTML): ${screen.title}`);
          continue;
        } else {
          results.push({
            screen: screen.title,
            input: 'N/A',
            output: screen.output || 'N/A',
            success: false,
            error: 'No local HTML file found',
          });
          continue;
        }
      }

      const outputPath = resolveOutputPath(screen, options.output);

      if (options.dryRun) {
        console.log(`[DRY RUN] Would convert: ${screen.title}`);
        console.log(`          Input: ${inputPath}`);
        console.log(`          Output: ${outputPath}`);
        results.push({
          screen: screen.title,
          input: inputPath,
          output: outputPath,
          success: true,
        });
      } else {
        console.log(`Converting: ${screen.title}`);
        const result = convertScreen(inputPath, outputPath, screen.title);
        results.push(result);

        if (result.success) {
          console.log(`  ✅ ${result.output} (${result.linesWritten} lines)`);
        } else {
          console.log(`  ❌ ${result.error}`);
        }
      }
    }
  } else if (options.dir) {
    // Process all HTML files in directory
    if (!existsSync(options.dir)) {
      console.error(`Error: Directory not found: ${options.dir}`);
      process.exit(1);
    }

    const htmlFiles = readdirSync(options.dir)
      .filter(f => extname(f).toLowerCase() === '.html');

    console.log(`\nDirectory: ${options.dir}`);
    console.log(`HTML files found: ${htmlFiles.length}`);
    console.log(`Output base: ${options.output}`);
    console.log('');

    for (const file of htmlFiles) {
      const inputPath = join(options.dir, file);
      const baseName = basename(file, '.html');
      const outputPath = join(options.output, baseName, 'page.tsx');

      if (options.dryRun) {
        console.log(`[DRY RUN] Would convert: ${file}`);
        console.log(`          Output: ${outputPath}`);
        results.push({
          screen: baseName,
          input: inputPath,
          output: outputPath,
          success: true,
        });
      } else {
        console.log(`Converting: ${file}`);
        const result = convertScreen(inputPath, outputPath, baseName);
        results.push(result);

        if (result.success) {
          console.log(`  ✅ ${result.output} (${result.linesWritten} lines)`);
        } else {
          console.log(`  ❌ ${result.error}`);
        }
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('CONVERSION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\nTotal: ${results.length}`);
  console.log(`Success: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed conversions:');
    for (const f of failed) {
      console.log(`  - ${f.screen}: ${f.error}`);
    }
  }

  // Write manifest
  if (!options.dryRun && results.length > 0) {
    const manifestPath = join(options.output, 'manifest.json');
    const manifest = {
      generated: new Date().toISOString(),
      project: options.project || 'stitch-conversion',
      source: options.screens || options.dir,
      results: results.map(r => ({
        screen: r.screen,
        output: r.output,
        success: r.success,
        lines: r.linesWritten,
        error: r.error,
      })),
      summary: {
        total: results.length,
        success: successful.length,
        failed: failed.length,
      },
    };

    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\nManifest written to: ${manifestPath}`);
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
