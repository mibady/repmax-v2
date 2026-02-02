---
name: chatgpt-complete
description: Complete ChatGPT GPT/Plugin development including Actions (API integrations), OpenAPI specs, authentication (API Key, OAuth), custom instructions, and response formatting. Use when building custom GPTs, ChatGPT plugins, or Actions. Triggers on "chatgpt plugin", "custom gpt", "gpt action", "openapi for chatgpt", "chatgpt api".
---

# ChatGPT Development

Build custom GPTs with Actions, instructions, and knowledge.

## GPT Components

| Component                 | Purpose                         |
| ------------------------- | ------------------------------- |
| **Instructions**          | System prompt defining behavior |
| **Knowledge**             | Uploaded files for RAG          |
| **Actions**               | API integrations via OpenAPI    |
| **Conversation Starters** | Suggested prompts               |

## Actions Quick Start

```yaml
openapi: 3.1.0
info:
  title: My API
  description: API for searching items
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /search:
    get:
      operationId: searchItems
      summary: Search for items
      description: Use this to find items by keyword
      parameters:
        - name: query
          in: query
          required: true
          schema:
            type: string
          description: Search term
      responses:
        "200":
          description: Results
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    items:
                      type: object
```

## Authentication

### API Key

```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
security:
  - ApiKeyAuth: []
```

### OAuth 2.0

```yaml
components:
  securitySchemes:
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://example.com/oauth/authorize
          tokenUrl: https://example.com/oauth/token
          scopes:
            read: Read access
            write: Write access
```

## Response Formatting

GPTs can use Markdown:

````markdown
## Section Header

**Bold** and _italic_

| Column 1 | Column 2 |
| -------- | -------- |
| Data     | Data     |

- Bullet points
- For lists

`code blocks for technical content`
````

## Best Practices

- `operationId` becomes the function name GPT calls
- Descriptions guide GPT's decision-making (be detailed!)
- Keep schemas simple and flat
- Include example values
- Handle errors with meaningful messages
- Test with diverse queries
- Keep instructions concise but specific
