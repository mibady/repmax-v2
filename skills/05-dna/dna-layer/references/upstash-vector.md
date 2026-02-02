# Upstash Vector - Serverless Vector Database

**Official Website:** https://upstash.com/vector
**Documentation:** https://upstash.com/docs/vector
**Pricing:** Free tier: 10,000 queries/day, 10,000 vectors

---

## Overview

Upstash Vector is a serverless vector database designed for AI applications. It provides similarity search, metadata filtering, and namespaces for organizing vectors. Perfect for RAG (Retrieval Augmented Generation), semantic search, and AI-powered applications with pay-per-request pricing.

### Key Features

- ✅ Serverless vector storage
- ✅ Similarity search (cosine, euclidean, dot product)
- ✅ Metadata filtering
- ✅ Namespaces for organization
- ✅ REST API
- ✅ Global replication
- ✅ Edge-compatible
- ✅ TypeScript SDK
- ✅ OpenAI integration
- ✅ Pay-per-request pricing

---

## Use Cases for AI Coder

1. **RAG Applications**
   - Document search
   - Knowledge bases
   - Context retrieval
   - Q&A systems

2. **Semantic Search**
   - Content discovery
   - Similar products
   - Recommendation engines
   - Duplicate detection

3. **AI Memory**
   - Conversation history
   - User preferences
   - Long-term memory
   - Context management

4. **Content Organization**
   - Document clustering
   - Tag suggestions
   - Category prediction
   - Content matching

---

## Quick Start

### 1. Installation

```bash
npm install @upstash/vector
# or
pnpm add @upstash/vector
```

### 2. Create Vector Database

1. Sign up at https://upstash.com
2. Create a new Vector database
3. Choose embedding dimensions (e.g., 1536 for OpenAI)
4. Copy your REST URL and token
5. Add to `.env.local`:

```bash
UPSTASH_VECTOR_REST_URL=https://xxx.upstash.io
UPSTASH_VECTOR_REST_TOKEN=xxx

# For OpenAI embeddings
OPENAI_API_KEY=sk-xxx
```

### 3. Initialize Client

```typescript
// lib/upstash-vector.ts
import { Index } from '@upstash/vector';

export const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});
```

---

## Basic Operations

### Upsert Vectors

```typescript
// app/actions/store-embedding.ts
'use server';

import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function storeDocument(content: string, metadata: any) {
  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: content,
  });

  const embedding = response.data[0].embedding;

  // Store in vector database
  await vectorIndex.upsert([
    {
      id: metadata.id,
      vector: embedding,
      metadata: {
        content,
        ...metadata,
      },
    },
  ]);

  return { success: true };
}
```

### Query Vectors

```typescript
// app/actions/search.ts
'use server';

import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function searchDocuments(query: string, topK = 5) {
  // Generate query embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const embedding = response.data[0].embedding;

  // Search similar vectors
  const results = await vectorIndex.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  return results;
}
```

### Delete Vectors

```typescript
// app/actions/delete-document.ts
'use server';

import { vectorIndex } from '@/lib/upstash-vector';

export async function deleteDocument(id: string) {
  await vectorIndex.delete(id);
  return { success: true };
}

// Delete multiple
export async function deleteDocuments(ids: string[]) {
  await vectorIndex.delete(ids);
  return { success: true };
}
```

---

## Advanced Features

### Metadata Filtering

```typescript
// app/actions/filtered-search.ts
'use server';

import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function searchWithFilter(
  query: string,
  userId: string,
  category?: string
) {
  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const embedding = response.data[0].embedding;

  // Search with metadata filter
  const results = await vectorIndex.query({
    vector: embedding,
    topK: 10,
    includeMetadata: true,
    filter: category
      ? `userId = '${userId}' AND category = '${category}'`
      : `userId = '${userId}'`,
  });

  return results;
}
```

### Namespaces

```typescript
// lib/vector-namespaces.ts
import { Index } from '@upstash/vector';

// Create namespace for user documents
export function getUserVectorIndex(userId: string) {
  return new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    namespace: `user-${userId}`,
  });
}

// Create namespace for public documents
export const publicVectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  namespace: 'public',
});
```

### Batch Operations

```typescript
// app/actions/batch-upsert.ts
'use server';

import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function storeMultipleDocuments(
  documents: Array<{ id: string; content: string; metadata: any }>
) {
  // Generate embeddings in batch
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: documents.map((doc) => doc.content),
  });

  // Prepare vectors
  const vectors = documents.map((doc, i) => ({
    id: doc.id,
    vector: response.data[i].embedding,
    metadata: {
      content: doc.content,
      ...doc.metadata,
    },
  }));

  // Batch upsert (up to 1000 vectors per request)
  const batchSize = 1000;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await vectorIndex.upsert(batch);
  }

  return { success: true, count: vectors.length };
}
```

### Range Queries

```typescript
// app/actions/range-query.ts
'use server';

import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function findSimilarAboveThreshold(
  query: string,
  minScore = 0.7
) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const embedding = response.data[0].embedding;

  // Get top results
  const results = await vectorIndex.query({
    vector: embedding,
    topK: 100,
    includeMetadata: true,
  });

  // Filter by score threshold
  return results.filter((result) => result.score >= minScore);
}
```

---

## RAG Implementation

### Complete RAG Pipeline

```typescript
// lib/rag.ts
import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function ragQuery(question: string, userId?: string) {
  // 1. Generate embedding for question
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  });

  const embedding = embeddingResponse.data[0].embedding;

  // 2. Search similar documents
  const searchResults = await vectorIndex.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
    filter: userId ? `userId = '${userId}'` : undefined,
  });

  // 3. Build context from results
  const context = searchResults
    .map((result) => result.metadata.content)
    .join('\n\n');

  // 4. Generate answer with context
  const chatResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant. Use the following context to answer the question. If the answer is not in the context, say so.

Context:
${context}`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
  });

  return {
    answer: chatResponse.choices[0].message.content,
    sources: searchResults.map((r) => ({
      id: r.id,
      score: r.score,
      metadata: r.metadata,
    })),
  };
}
```

### Document Processing Pipeline

```typescript
// lib/document-processor.ts
import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function processDocument(
  documentId: string,
  content: string,
  metadata: any
) {
  // 1. Split into chunks
  const chunks = splitIntoChunks(content, 500); // 500 words per chunk

  // 2. Generate embeddings for all chunks
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunks,
  });

  // 3. Store chunks with embeddings
  const vectors = chunks.map((chunk, i) => ({
    id: `${documentId}-chunk-${i}`,
    vector: response.data[i].embedding,
    metadata: {
      documentId,
      chunkIndex: i,
      content: chunk,
      ...metadata,
    },
  }));

  await vectorIndex.upsert(vectors);

  return {
    success: true,
    chunks: chunks.length,
  };
}

function splitIntoChunks(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }

  return chunks;
}
```

---

## Integration with AI Coder Services

### With Inngest (Background Processing)

```typescript
// inngest/functions/process-upload.ts
import { inngest } from '@/lib/inngest';
import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const processDocumentUpload = inngest.createFunction(
  { id: 'process-document-upload' },
  { event: 'document.uploaded' },
  async ({ event, step }) => {
    // Extract text
    const text = await step.run('extract-text', async () => {
      return await extractText(event.data.url);
    });

    // Split into chunks
    const chunks = await step.run('split-chunks', async () => {
      return splitIntoChunks(text, 500);
    });

    // Generate embeddings
    const embeddings = await step.run('generate-embeddings', async () => {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks,
      });
      return response.data.map((d) => d.embedding);
    });

    // Store in vector database
    await step.run('store-vectors', async () => {
      const vectors = chunks.map((chunk, i) => ({
        id: `${event.data.documentId}-${i}`,
        vector: embeddings[i],
        metadata: {
          documentId: event.data.documentId,
          userId: event.data.userId,
          content: chunk,
          chunkIndex: i,
        },
      }));

      return await vectorIndex.upsert(vectors);
    });
  }
);
```

### With Clerk (User Context)

```typescript
// app/api/chat/route.ts
import { createClient } from '@/lib/supabase/server';
import { vectorIndex } from '@/lib/upstash-vector';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await request.json();

  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: message,
  });

  // Search user's documents only
  const results = await vectorIndex.query({
    vector: response.data[0].embedding,
    topK: 5,
    includeMetadata: true,
    filter: `userId = '${userId}'`,
  });

  return NextResponse.json({ results });
}
```

### With Supabase (Hybrid Search)

```typescript
// lib/hybrid-search.ts
import { vectorIndex } from '@/lib/upstash-vector';
import { createServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function hybridSearch(query: string, userId: string) {
  // 1. Vector search
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const vectorResults = await vectorIndex.query({
    vector: embeddingResponse.data[0].embedding,
    topK: 10,
    includeMetadata: true,
    filter: `userId = '${userId}'`,
  });

  // 2. Full-text search in Supabase
  const supabase = createServerClient();
  const { data: textResults } = await supabase
    .from('documents')
    .select('*')
    .textSearch('content', query)
    .eq('user_id', userId)
    .limit(10);

  // 3. Merge and rank results
  const merged = mergeResults(vectorResults, textResults);

  return merged;
}

function mergeResults(vectorResults: any[], textResults: any[]) {
  // Combine and deduplicate results
  const resultMap = new Map();

  vectorResults.forEach((result) => {
    resultMap.set(result.id, {
      ...result,
      vectorScore: result.score,
    });
  });

  textResults?.forEach((result) => {
    if (resultMap.has(result.id)) {
      resultMap.get(result.id).textMatch = true;
    } else {
      resultMap.set(result.id, {
        ...result,
        textMatch: true,
      });
    }
  });

  return Array.from(resultMap.values()).sort((a, b) => {
    // Prioritize results that match both vector and text search
    if (a.textMatch && a.vectorScore && !(b.textMatch && b.vectorScore)) {
      return -1;
    }
    if (b.textMatch && b.vectorScore && !(a.textMatch && a.vectorScore)) {
      return 1;
    }
    return (b.vectorScore || 0) - (a.vectorScore || 0);
  });
}
```

---

## Similarity Search Patterns

### Find Similar Documents

```typescript
// app/actions/find-similar.ts
'use server';

import { vectorIndex } from '@/lib/upstash-vector';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function findSimilarDocuments(
  documentId: string,
  excludeSelf = true
) {
  // Get document's embedding
  const doc = await vectorIndex.fetch([documentId]);

  if (!doc || doc.length === 0) {
    throw new Error('Document not found');
  }

  // Search for similar documents
  const results = await vectorIndex.query({
    vector: doc[0].vector,
    topK: excludeSelf ? 11 : 10, // Get extra if excluding self
    includeMetadata: true,
  });

  // Filter out the original document if requested
  return excludeSelf
    ? results.filter((r) => r.id !== documentId).slice(0, 10)
    : results;
}
```

### Semantic Deduplication

```typescript
// app/actions/find-duplicates.ts
'use server';

import { vectorIndex } from '@/lib/upstash-vector';

export async function findDuplicates(threshold = 0.95) {
  // This would require fetching all vectors and comparing
  // Better to do this during insertion
  const duplicates: Array<{ id1: string; id2: string; score: number }> = [];

  // Implementation would involve comparing vectors pairwise
  // For large datasets, use batch processing with Inngest

  return duplicates;
}
```

---

## Best Practices

### 1. Environment Variables

```bash
# Required
UPSTASH_VECTOR_REST_URL=https://xxx.upstash.io
UPSTASH_VECTOR_REST_TOKEN=xxx

# For embeddings
OPENAI_API_KEY=sk-xxx
```

### 2. Chunk Size Optimization

```typescript
// Optimize chunk size for your use case
const CHUNK_SIZE = {
  short: 200, // Short snippets (tweets, reviews)
  medium: 500, // Articles, documentation
  long: 1000, // Long-form content, books
};

// Include overlap for better context
function splitWithOverlap(text: string, size: number, overlap: number) {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += size - overlap) {
    chunks.push(words.slice(i, i + size).join(' '));
  }

  return chunks;
}
```

### 3. Metadata Design

```typescript
// Store useful metadata for filtering and display
interface VectorMetadata {
  // Required
  content: string;
  documentId: string;

  // For filtering
  userId: string;
  category: string;
  tags: string[];

  // For display
  title: string;
  createdAt: string;

  // For chunking
  chunkIndex?: number;
  totalChunks?: number;
}
```

### 4. Error Handling

```typescript
try {
  const results = await vectorIndex.query({
    vector: embedding,
    topK: 10,
  });
  return results;
} catch (error) {
  console.error('Vector search error:', error);
  // Fallback to text search or return empty results
  return [];
}
```

### 5. Caching Embeddings

```typescript
// Cache embeddings to avoid regenerating
import { redis } from '@/lib/upstash-redis';

async function getEmbedding(text: string) {
  const cacheKey = `embedding:${hashText(text)}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  const embedding = response.data[0].embedding;

  // Cache for 30 days
  await redis.setex(cacheKey, 2592000, JSON.stringify(embedding));

  return embedding;
}
```

---

## Pricing

**Free Tier:**
- 10,000 queries/day
- 10,000 vectors
- Single region

**Pay-as-you-go:**
- $0.40 per 1M queries
- $0.40 per 1M vector updates
- $0.25 per GB storage

**Pro ($60/month):**
- Includes 10M queries
- 1M vectors
- Multi-region replication

---

## Resources

- **Documentation:** https://upstash.com/docs/vector
- **Console:** https://console.upstash.com
- **SDK Reference:** https://upstash.com/docs/vector/sdks/ts/overview
- **Examples:** https://github.com/upstash/vector-js/tree/main/examples

---

## Next Steps

1. Create Upstash Vector database
2. Choose embedding dimensions
3. Install @upstash/vector
4. Set up OpenAI for embeddings
5. Implement document ingestion
6. Build search interface
7. Test with real queries
8. Optimize chunk sizes and metadata

For more examples, see the template repositories in `/home/mibady/ai-coder-workspace/templates/`.
