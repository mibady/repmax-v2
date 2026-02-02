# Advanced Learning Features

**Phase 6: Advanced RAG Learning System**

AI Coder includes advanced learning capabilities that automatically discover patterns, provide recommendations, and improve over time based on your development activities.

---

## Table of Contents

1. [Overview](#overview)
2. [Pattern Matching](#pattern-matching)
3. [Learning Metrics](#learning-metrics)
4. [Automatic Learning](#automatic-learning)
5. [MCP Tools](#mcp-tools)
6. [Best Practices](#best-practices)

---

## Overview

The advanced learning system provides:

- **Pattern Discovery** - Find similar code patterns across all indexed projects
- **Smart Recommendations** - Get context-aware pattern suggestions
- **Learning Analytics** - Track pattern extraction and RAG performance
- **Automatic Learning** - Continuous learning from development activities
- **Performance Metrics** - Monitor learning effectiveness and trends

---

## Pattern Matching

### Find Similar Patterns

Discover code patterns similar to your current implementation:

**MCP Tool:**
```typescript
{
  "tool": "find_similar_patterns",
  "codeSnippet": "async function handleAuth() { ... }",
  "category": "auth",
  "framework": "Next.js",
  "minSimilarity": 0.7,
  "limit": 5
}
```

**Returns:**
- Matching patterns with similarity scores
- Framework and complexity information
- Usage statistics
- Suggested applications

**Use Cases:**
- Find existing solutions before writing new code
- Discover best practices in your codebase
- Identify refactoring opportunities
- Learn from past implementations

### Get Pattern Recommendations

Get pattern recommendations based on your current context:

**MCP Tool:**
```typescript
{
  "tool": "recommend_patterns",
  "currentFile": "src/app/api/auth/route.ts",
  "projectType": "web-app",
  "framework": "Next.js",
  "task": "implement user authentication"
}
```

**Returns:**
- Relevant patterns for your task
- Framework-specific recommendations
- Complexity assessments
- Implementation suggestions

**Use Cases:**
- Start new features with proven patterns
- Get architecture suggestions
- Find relevant examples quickly
- Reduce development time

### Pattern Analytics

View analytics about learned patterns:

**MCP Tool:**
```typescript
{
  "tool": "get_pattern_analytics"
}
```

**Returns:**
```json
{
  "totalPatterns": 347,
  "byCategory": {
    "auth": 45,
    "api": 89,
    "database": 67,
    "ui": 102,
    "testing": 44
  },
  "byFramework": {
    "Next.js": 156,
    "Express": 78,
    "React": 113
  },
  "avgComplexity": 2.1,
  "mostUsed": [
    { "name": "JWT Authentication", "usageCount": 23 },
    { "name": "API Route Handler", "usageCount": 19 }
  ],
  "recentlyAdded": [...]
}
```

---

## Learning Metrics

### Get Learning Metrics

View comprehensive learning system metrics:

**MCP Tool:**
```typescript
{
  "tool": "get_learning_metrics"
}
```

**Returns:**
```json
{
  "metrics": {
    "patterns": {
      "total": 347,
      "successful": 342,
      "failed": 5,
      "avgExtractionTime": 245,
      "byComplexity": {
        "low": 123,
        "medium": 189,
        "high": 35
      },
      "topCategories": [...]
    },
    "rag": {
      "totalQueries": 1247,
      "avgResponseTime": 156,
      "avgRelevanceScore": 0.847,
      "vectorCount": 1049,
      "performanceTrend": "improving"
    },
    "learning": {
      "totalSessions": 23,
      "totalPatternsLearned": 347,
      "totalFilesIndexed": 892,
      "totalChunksCreated": 4521,
      "learningRate": 15.09,
      "recommendations": [
        "Learning system is performing well",
        "Consider consolidating similar patterns"
      ]
    }
  }
}
```

### Performance Metrics

**Pattern Extraction:**
- Success/failure rates
- Average extraction time
- Distribution by complexity
- Top categories

**RAG Performance:**
- Total queries performed
- Average response time
- Relevance scores
- Vector count
- Performance trends (improving/stable/degrading)

**Learning Progress:**
- Total sessions
- Patterns learned
- Files indexed
- Learning rate (patterns per session)
- System recommendations

---

## Automatic Learning

### Start Automatic Learning

Enable continuous learning from development activities:

**MCP Tool:**
```typescript
{
  "tool": "start_automatic_learning",
  "autoIndexNewFiles": true,
  "autoExtractPatterns": true,
  "enableScheduledLearning": false,
  "learningInterval": 3600000  // 1 hour
}
```

**Configuration:**
- `autoIndexNewFiles` - Automatically index new/modified files
- `autoExtractPatterns` - Extract patterns from changes
- `enableScheduledLearning` - Periodic learning snapshots
- `learningInterval` - Interval in milliseconds (default: 1 hour)

**When It Runs:**
- After file changes (if 3+ files modified)
- After session completion
- On schedule (if enabled)
- Manual triggers

### Trigger Manual Learning

Manually trigger learning for a project:

**MCP Tool:**
```typescript
{
  "tool": "trigger_learning",
  "projectPath": "/path/to/project",
  "indexAllFiles": true,
  "extractPatterns": true
}
```

**Use Cases:**
- After major refactoring
- After implementing new features
- When updating project documentation
- For periodic knowledge base updates

**Returns:**
```json
{
  "success": true,
  "filesIndexed": 87,
  "patternsExtracted": 34,
  "chunksCreated": 456,
  "duration": "12.45s"
}
```

---

## MCP Tools

### Tool Summary

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `find_similar_patterns` | Find similar code patterns | Before implementing new features |
| `recommend_patterns` | Get pattern recommendations | Starting new tasks |
| `get_pattern_analytics` | View pattern statistics | Understanding codebase patterns |
| `get_learning_metrics` | View learning performance | Monitoring system health |
| `start_automatic_learning` | Enable auto-learning | Beginning of development session |
| `trigger_learning` | Manual learning trigger | After major changes |

### Integration with Existing Tools

Advanced learning works seamlessly with existing tools:

1. **Import Project** → **Trigger Learning**
   - `import_existing_project` indexes codebase
   - `trigger_learning` extracts patterns

2. **Query Knowledge Base** → **Find Similar Patterns**
   - `query_knowledge_base` finds relevant content
   - `find_similar_patterns` discovers similar implementations

3. **Learn from Session** → **Get Metrics**
   - `learn_from_session` indexes session patterns
   - `get_learning_metrics` shows learning progress

---

## Best Practices

### 1. Enable Automatic Learning

Start automatic learning at the beginning of each development session:

```typescript
{ "tool": "start_automatic_learning" }
```

This ensures continuous knowledge base updates.

### 2. Query Before Implementing

Before implementing new features, find similar patterns:

```typescript
{
  "tool": "find_similar_patterns",
  "codeSnippet": "your planned implementation",
  "category": "relevant category"
}
```

Learn from existing solutions to save time.

### 3. Review Pattern Analytics

Periodically review pattern analytics to:
- Identify frequently used patterns
- Find consolidation opportunities
- Understand codebase trends
- Optimize learning configuration

### 4. Monitor Learning Metrics

Check learning metrics regularly:

```typescript
{ "tool": "get_learning_metrics" }
```

Look for:
- **Performance trends** - Should be "improving" or "stable"
- **Relevance scores** - Should be > 0.7
- **Learning rate** - Adjust if too high/low
- **Recommendations** - Follow system suggestions

### 5. Manual Learning After Major Changes

Trigger manual learning after:
- Large refactoring
- New feature implementations
- Architecture changes
- Documentation updates

```typescript
{
  "tool": "trigger_learning",
  "projectPath": "/your/project",
  "indexAllFiles": true,
  "extractPatterns": true
}
```

### 6. Use Context-Aware Recommendations

Get recommendations based on your current context:

```typescript
{
  "tool": "recommend_patterns",
  "currentFile": "current file path",
  "framework": "your framework",
  "task": "what you're trying to do"
}
```

This provides the most relevant suggestions.

---

## Advanced Use Cases

### Pattern-Driven Development

1. **Start task** → Get recommendations
2. **Review similar patterns** → Find existing solutions
3. **Implement** → Use proven patterns
4. **Complete** → Trigger learning
5. **Review metrics** → Monitor effectiveness

### Codebase Refactoring

1. **Get pattern analytics** → Identify most used patterns
2. **Find similar patterns** → Discover variations
3. **Consolidate** → Merge similar implementations
4. **Trigger learning** → Update knowledge base
5. **Get metrics** → Verify improvement

### Team Knowledge Sharing

1. **Import projects** → Index team codebases
2. **Extract patterns** → Build pattern library
3. **Get analytics** → Understand team practices
4. **Recommend patterns** → Share best practices
5. **Monitor metrics** → Track adoption

---

## Configuration

### Learning System Configuration

Configure learning behavior via `start_automatic_learning`:

**Conservative (Default):**
```typescript
{
  "autoIndexNewFiles": true,
  "autoExtractPatterns": true,
  "enableScheduledLearning": false
}
```

**Aggressive:**
```typescript
{
  "autoIndexNewFiles": true,
  "autoExtractPatterns": true,
  "enableScheduledLearning": true,
  "learningInterval": 1800000  // 30 minutes
}
```

**Manual Only:**
```typescript
{
  "autoIndexNewFiles": false,
  "autoExtractPatterns": false,
  "enableScheduledLearning": false
}
```

### Pattern Matching Configuration

Adjust pattern matching sensitivity:

**High Precision (fewer, more relevant results):**
```typescript
{
  "minSimilarity": 0.85,
  "limit": 3
}
```

**High Recall (more results, less precise):**
```typescript
{
  "minSimilarity": 0.6,
  "limit": 10
}
```

---

## Troubleshooting

### Low Relevance Scores

**Issue:** Average relevance score < 0.6

**Solutions:**
1. Review query phrasing
2. Index more diverse projects
3. Consolidate duplicate patterns
4. Update embeddings model

### Poor Pattern Recommendations

**Issue:** Recommendations not relevant to task

**Solutions:**
1. Provide more specific context
2. Include framework information
3. Describe task in detail
4. Review pattern analytics for gaps

### Slow Learning Performance

**Issue:** Learning takes too long

**Solutions:**
1. Reduce learning interval
2. Disable scheduled learning
3. Index fewer files per session
4. Optimize pattern extraction

### Performance Degrading Trend

**Issue:** RAG performance trend = "degrading"

**Solutions:**
1. Review recent changes
2. Check for duplicate vectors
3. Consolidate similar patterns
4. Re-index knowledge base

---

## Integration with CI/CD

The learning system integrates with GitHub Actions:

**Auto-Update After Push:**
- Workflow: `update-knowledge-base.yml`
- Triggers: Push to main with src/ or docs/ changes
- Actions: Indexes changes, extracts patterns

**Scheduled Learning:**
- Workflow: Runs daily at 2 AM UTC
- Actions: Creates knowledge base snapshots
- Benefits: Tracks knowledge growth over time

---

## Next Steps

1. **Enable automatic learning** in your Claude Desktop session
2. **Review pattern analytics** to understand your codebase
3. **Get recommendations** before starting new features
4. **Monitor metrics** to track learning effectiveness
5. **Integrate with workflows** for continuous improvement

---

**Related Documentation:**
- [Import Existing Project](./import-existing-project.md)
- [Continue Development](./continue-development.md)
- [Fix Bugs](./fix-bugs.md)
- [GitHub Actions Workflows](../../.github/workflows/README.md)

---

**Last Updated:** 2025-10-22
**Version:** 2.0.0 (Phase 6)
