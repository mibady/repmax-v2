#!/usr/bin/env npx tsx
/**
 * Stitch Extract Script
 *
 * Extracts data model from Stitch HTML designs.
 * Analyzes forms, tables, cards to infer entities and API endpoints.
 *
 * Usage:
 *   npm run stitch:extract -- --dir stitch-exports/ --output schema-suggestion.json
 *
 * Options:
 *   --dir <path>      Directory containing HTML files to analyze
 *   --output <path>   Output path for schema suggestion JSON
 *   --verbose         Show detailed extraction info
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, extname, basename } from 'path';
import { JSDOM } from 'jsdom';

interface FieldInfo {
  name: string;
  type: string;
  required: boolean;
  enumValues?: string[];
}

interface EntityInfo {
  name: string;
  fields: FieldInfo[];
  source_screens: string[];
}

interface ApiEndpoint {
  method: string;
  path: string;
  source: string;
  description?: string;
}

interface SchemaExtraction {
  extractedAt: string;
  source: string;
  entities: EntityInfo[];
  api_endpoints: ApiEndpoint[];
}

interface ExtractOptions {
  dir: string;
  output: string;
  verbose?: boolean;
}

function parseArgs(): ExtractOptions {
  const args = process.argv.slice(2);
  const options: ExtractOptions = { dir: '', output: '' };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dir':
        options.dir = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  }

  return options;
}

function inferFieldType(input: Element): string {
  const type = input.getAttribute('type')?.toLowerCase() || 'text';

  switch (type) {
    case 'email':
      return 'string';
    case 'number':
    case 'range':
      return 'number';
    case 'date':
    case 'datetime-local':
      return 'timestamp';
    case 'checkbox':
      return 'boolean';
    case 'file':
      return 'string'; // URL or path
    case 'tel':
    case 'url':
    case 'text':
    case 'password':
    default:
      return 'string';
  }
}

function extractFormFields(doc: Document, screenName: string): { entity: EntityInfo; endpoints: ApiEndpoint[] } | null {
  const forms = doc.querySelectorAll('form');
  if (forms.length === 0) return null;

  const fields: FieldInfo[] = [];
  const endpoints: ApiEndpoint[] = [];

  forms.forEach((form, idx) => {
    // Get form action for API endpoint hints
    const action = form.getAttribute('action');
    const method = (form.getAttribute('method') || 'POST').toUpperCase();

    if (action && action !== '#') {
      endpoints.push({
        method,
        path: action,
        source: `${screenName} form`,
      });
    }

    // Extract inputs
    form.querySelectorAll('input, select, textarea').forEach(input => {
      const name = input.getAttribute('name') || input.getAttribute('id');
      if (!name) return;

      // Skip common non-data fields
      if (['csrf', 'token', '_method', 'submit'].some(s => name.toLowerCase().includes(s))) return;

      const field: FieldInfo = {
        name: name,
        type: inferFieldType(input),
        required: input.hasAttribute('required'),
      };

      // Check for select options
      if (input.tagName === 'SELECT') {
        const options = Array.from(input.querySelectorAll('option'))
          .map(o => o.textContent?.trim())
          .filter(Boolean);
        if (options.length > 0 && options.length <= 10) {
          field.type = 'enum';
          field.enumValues = options as string[];
        }
      }

      // Avoid duplicates
      if (!fields.find(f => f.name === field.name)) {
        fields.push(field);
      }
    });
  });

  if (fields.length === 0) return null;

  // Infer entity name from screen name or form fields
  let entityName = screenName
    .replace(/[-_]?(form|page|screen|modal|dialog)/gi, '')
    .replace(/[-_]+/g, '_')
    .toLowerCase();

  // Make plural if not already
  if (!entityName.endsWith('s')) {
    entityName += 's';
  }

  return {
    entity: {
      name: entityName,
      fields: [
        { name: 'id', type: 'uuid', required: true },
        ...fields,
      ],
      source_screens: [screenName],
    },
    endpoints,
  };
}

function extractTableData(doc: Document, screenName: string): { entity: EntityInfo; endpoints: ApiEndpoint[] } | null {
  const tables = doc.querySelectorAll('table');
  if (tables.length === 0) return null;

  const fields: FieldInfo[] = [];
  const endpoints: ApiEndpoint[] = [];

  tables.forEach(table => {
    // Get headers
    const headers = Array.from(table.querySelectorAll('th'))
      .map(th => th.textContent?.trim())
      .filter(Boolean);

    headers.forEach(header => {
      const name = (header as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');

      if (!name || ['actions', 'options', 'menu'].includes(name)) return;

      const field: FieldInfo = {
        name,
        type: 'string', // Default, could be refined
        required: false,
      };

      if (!fields.find(f => f.name === field.name)) {
        fields.push(field);
      }
    });
  });

  if (fields.length === 0) return null;

  let entityName = screenName
    .replace(/[-_]?(list|table|page|screen)/gi, '')
    .replace(/[-_]+/g, '_')
    .toLowerCase();

  if (!entityName.endsWith('s')) {
    entityName += 's';
  }

  // Table implies a list endpoint
  endpoints.push({
    method: 'GET',
    path: `/api/${entityName}`,
    source: `${screenName} table`,
    description: `List all ${entityName}`,
  });

  return {
    entity: {
      name: entityName,
      fields: [
        { name: 'id', type: 'uuid', required: true },
        ...fields,
      ],
      source_screens: [screenName],
    },
    endpoints,
  };
}

function extractButtonActions(doc: Document, screenName: string): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];

  // Find buttons that suggest CRUD operations
  const buttons = Array.from(doc.querySelectorAll('button, a[class*="btn"], [role="button"]'));

  buttons.forEach(btn => {
    const text = btn.textContent?.toLowerCase().trim() || '';

    // Create/Add
    if (text.match(/^(create|add|new|submit|save)/)) {
      endpoints.push({
        method: 'POST',
        path: '/api/{entity}',
        source: `${screenName} "${btn.textContent?.trim()}" button`,
      });
    }

    // Update/Edit
    if (text.match(/^(update|edit|save|modify)/)) {
      endpoints.push({
        method: 'PUT',
        path: '/api/{entity}/{id}',
        source: `${screenName} "${btn.textContent?.trim()}" button`,
      });
    }

    // Delete/Remove
    if (text.match(/^(delete|remove|cancel|destroy)/)) {
      endpoints.push({
        method: 'DELETE',
        path: '/api/{entity}/{id}',
        source: `${screenName} "${btn.textContent?.trim()}" button`,
      });
    }
  });

  return endpoints;
}

function extractCardData(doc: Document, screenName: string): { entity: EntityInfo | null; endpoints: ApiEndpoint[] } {
  // Look for repeated card structures
  const cards = doc.querySelectorAll('[class*="card"], [class*="Card"]');
  const endpoints: ApiEndpoint[] = [];

  if (cards.length <= 1) {
    return { entity: null, endpoints };
  }

  // If multiple cards, likely a list - implies GET endpoint
  endpoints.push({
    method: 'GET',
    path: '/api/{entity}',
    source: `${screenName} cards list`,
    description: 'List endpoint inferred from card grid',
  });

  return { entity: null, endpoints };
}

function analyzeHtmlFile(filePath: string, verbose: boolean): { entities: EntityInfo[]; endpoints: ApiEndpoint[] } {
  const html = readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const screenName = basename(filePath, '.html');
  const entities: EntityInfo[] = [];
  const endpoints: ApiEndpoint[] = [];

  if (verbose) {
    console.log(`\nAnalyzing: ${screenName}`);
  }

  // Extract from forms
  const formResult = extractFormFields(doc, screenName);
  if (formResult) {
    entities.push(formResult.entity);
    endpoints.push(...formResult.endpoints);
    if (verbose) {
      console.log(`  Found form with ${formResult.entity.fields.length} fields`);
    }
  }

  // Extract from tables
  const tableResult = extractTableData(doc, screenName);
  if (tableResult) {
    entities.push(tableResult.entity);
    endpoints.push(...tableResult.endpoints);
    if (verbose) {
      console.log(`  Found table with ${tableResult.entity.fields.length} columns`);
    }
  }

  // Extract button actions
  const buttonEndpoints = extractButtonActions(doc, screenName);
  endpoints.push(...buttonEndpoints);
  if (verbose && buttonEndpoints.length > 0) {
    console.log(`  Found ${buttonEndpoints.length} action buttons`);
  }

  // Extract card data hints
  const cardResult = extractCardData(doc, screenName);
  endpoints.push(...cardResult.endpoints);

  return { entities, endpoints };
}

function mergeEntities(entities: EntityInfo[]): EntityInfo[] {
  const merged: Map<string, EntityInfo> = new Map();

  for (const entity of entities) {
    const existing = merged.get(entity.name);
    if (existing) {
      // Merge fields
      for (const field of entity.fields) {
        if (!existing.fields.find(f => f.name === field.name)) {
          existing.fields.push(field);
        }
      }
      // Merge source screens
      for (const source of entity.source_screens) {
        if (!existing.source_screens.includes(source)) {
          existing.source_screens.push(source);
        }
      }
    } else {
      merged.set(entity.name, { ...entity });
    }
  }

  return Array.from(merged.values());
}

function deduplicateEndpoints(endpoints: ApiEndpoint[]): ApiEndpoint[] {
  const seen = new Set<string>();
  return endpoints.filter(ep => {
    const key = `${ep.method}:${ep.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const options = parseArgs();

  if (!options.dir || !options.output) {
    console.error('Error: --dir and --output are required');
    console.error('Usage: npm run stitch:extract -- --dir stitch-exports/ --output schema-suggestion.json');
    process.exit(1);
  }

  if (!existsSync(options.dir)) {
    console.error(`Error: Directory not found: ${options.dir}`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('STITCH SCHEMA EXTRACTION');
  console.log('='.repeat(60));
  console.log(`\nSource: ${options.dir}`);

  const htmlFiles = readdirSync(options.dir)
    .filter(f => extname(f).toLowerCase() === '.html');

  console.log(`HTML files found: ${htmlFiles.length}\n`);

  let allEntities: EntityInfo[] = [];
  let allEndpoints: ApiEndpoint[] = [];

  for (const file of htmlFiles) {
    const filePath = join(options.dir, file);
    const { entities, endpoints } = analyzeHtmlFile(filePath, options.verbose || false);
    allEntities.push(...entities);
    allEndpoints.push(...endpoints);
  }

  // Merge and deduplicate
  const mergedEntities = mergeEntities(allEntities);
  const uniqueEndpoints = deduplicateEndpoints(allEndpoints);

  const schema: SchemaExtraction = {
    extractedAt: new Date().toISOString(),
    source: options.dir,
    entities: mergedEntities,
    api_endpoints: uniqueEndpoints,
  };

  writeFileSync(options.output, JSON.stringify(schema, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('EXTRACTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nEntities found: ${mergedEntities.length}`);
  for (const entity of mergedEntities) {
    console.log(`  - ${entity.name}: ${entity.fields.length} fields (from ${entity.source_screens.join(', ')})`);
  }
  console.log(`\nAPI endpoints inferred: ${uniqueEndpoints.length}`);
  for (const ep of uniqueEndpoints) {
    console.log(`  - ${ep.method} ${ep.path}`);
  }
  console.log(`\nOutput written to: ${options.output}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
