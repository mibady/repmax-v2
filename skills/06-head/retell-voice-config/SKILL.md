---
name: retell-voice-config
description: Configure Retell AI voice agents with production-ready best practices across all major settings. Use when working with Retell AI voice agents and need to configure or optimize functions, knowledge bases, speech settings, transcription, call settings, post-call analysis, security/fallback, webhooks, or MCP integrations. Essential for voice agent deployment, optimization, and troubleshooting.
---

# Retell AI Voice Agent Configuration

Production-ready configuration guide for Retell AI voice agents covering all critical settings.

## Quick Reference

**When to use this skill:**

- Setting up new Retell AI voice agents
- Optimizing existing agent performance
- Troubleshooting voice quality, latency, or reliability issues
- Configuring integrations (CRM, webhooks, MCP)
- Ensuring security and compliance (HIPAA, GDPR, SOC 2)

**Key configuration categories:**

1. Functions - Custom integrations and tool calling
2. Knowledge Base - Context and information retrieval
3. Speech Settings - Voice, responsiveness, interruption handling
4. Transcription - ASR accuracy and latency
5. Call Settings - Duration, DTMF, IVR navigation
6. Post-Call Analysis - Data extraction and insights
7. Security & Fallback - Compliance and reliability
8. Webhooks - Event-driven automation
9. MCP - Model Context Protocol integrations

## Core Configuration Workflow

Follow this sequence when configuring a new voice agent:

### 1. Define Agent Purpose and Use Case

- Identify primary function (support, sales, scheduling, etc.)
- List required integrations (CRM, calendar, payment, etc.)
- Determine compliance requirements (HIPAA, GDPR, etc.)
- Establish performance targets (latency, accuracy, uptime)

### 2. Configure Core Speech Settings

```
Recommended starting values:
- responsiveness: 1 (adjust -0.1 for elderly, +0.1 for fast-paced)
- interruption_sensitivity: 0.6-0.7 (office), 0.8-0.9 (quiet)
- voice_speed: 1 (default)
- enable_backchannel: true
- backchannel_frequency: 0.9
```

**Voice provider setup:**

- Select primary voice from ElevenLabs, PlayHT, OpenAI, or Cartesia
- **CRITICAL**: Set fallback voices from different TTS providers
- Configure voice_temperature (0-2, ElevenLabs only)

### 3. Set Up Knowledge Base (if needed)

**Use when:** Agent needs access to documentation, policies, FAQs, or product information

```
Best practices:
- Use Markdown (.md) format for best retrieval
- Structure with clear ## headings
- Keep sections focused and concise
- Enable auto-refresh for dynamic content (24hr updates)
- Enable auto-crawling for documentation sites
```

**Limits:**

- 10 free knowledge bases per workspace
- Max 200 URLs per KB (500 with auto-crawling)
- Max 25 files, 50MB each
- Create multiple KBs if limits are reached

**Organization strategy:**

- Segment by department (sales, support, compliance)
- Separate by update frequency (static vs dynamic)
- Group by content type (web, PDFs, docs)

### 4. Configure Functions and Integrations

**Use when:** Agent needs to take actions or retrieve live data

**Function configuration:**

1. Name functions clearly with underscores (e.g., `book_appointment`)
2. Write specific descriptions for function purpose
3. Define JSON schema parameters precisely
4. Enable "Speak After Execution" for user feedback
5. Implement signature verification (`X-Retell-Signature`)
6. Keep execution under 5 seconds

**Common integrations:**

- CRM: Salesforce, HubSpot
- Calendar: Cal.com, Calendly
- Automation: Zapier, Make, n8n
- Payment: Stripe

### 5. Set Transcription Mode

**Choose based on priority:**

- **Speed mode**: Minimal latency (default, recommended)
- **Accuracy mode**: +200ms latency, similar WER

**Additional transcription settings:**

- Add boosted keywords for brand names, products, technical terms
- Set language (en-US, es-ES, etc.) or "multi" for multilingual
- Enable word-level timestamps for analytics

### 6. Configure Call Behavior

```
Recommended settings:
- max_call_duration: 30-60 minutes (prevent abuse)
- end_call_after_silence: 10-30 seconds
- pause_before_speaking: 1-2 seconds
- ring_duration: 15-20s (consumer), 30-45s (B2B)
```

**Enable DTMF if:**

- PIN verification needed
- IVR navigation required
- Keypad input for account lookup

### 7. Set Up Post-Call Analysis

Define data extraction for business insights:

**Analysis types:**

- **Boolean**: Yes/no questions (e.g., "Did customer request refund?")
- **Text**: Extract details (e.g., complaint description)
- **Number**: Numerical values (e.g., order amount)
- **Selector**: Categories (e.g., sentiment: positive/neutral/negative)

**Common use cases:**

- Sales: buyer intent, objections, upsell opportunities
- Support: issue type, resolution status, satisfaction
- Compliance: regulatory adherence, script compliance

### 8. Configure Security and Compliance

**PII Redaction:**

- Enable for names, DOB, SSN, passwords, PINs, emails
- Configurable in Security & Fallback Settings
- Admins can still view for audits

**Data storage:**

- "everything": Store all data (default)
- "opt_out_sensitive_data_storage": Exclude sensitive data

**Compliance setup:**

- **HIPAA**: Sign BAA, configure PII redaction
- **GDPR**: Enable data controls, consent management
- **SOC 2**: Already certified, configure access controls

**Fallback configuration (CRITICAL):**

- Set fallback voices from different TTS providers
- Prevents call failures during provider outages
- List processes in order on failure

### 9. Set Up Webhooks (if needed)

**Use when:** Need real-time notifications or workflow automation

**Configuration:**

```javascript
webhook_url: "https://your-endpoint.com/webhook"
webhook_timeout_ms: 10000 (default)
```

**Event types:**

- call_started: When call connects
- call_ended: When call completes
- call_analyzed: Post-call analysis done
- custom_function: When function invoked

**Critical webhook requirements:**

- Return 200 OK within 5 seconds
- Process heavy work asynchronously
- Verify X-Retell-Signature header
- Implement idempotency with call_id

### 10. Configure MCP (if needed)

**Use when:** Need to connect to external APIs/tools

**Setup:**

1. Click "+ Add MCP" in agent builder
2. Set MCP Server Endpoint URL
3. Configure authentication (headers, query params)
4. Define request/response mappings
5. Extract values to dynamic variables

**Supported integrations:**

- CRMs, scheduling tools, databases
- Automation platforms (Zapier, Make)
- Custom APIs and microservices

## Performance Optimization

### Latency Targets

- **Overall**: <500ms end-to-end
- **Function execution**: <5 seconds
- **Webhook response**: <5 seconds (immediate 200 OK)
- **MCP calls**: <3 seconds for low latency

### Quality Metrics

- **Uptime**: 99.99% SLA
- **Transcription**: Industry-leading WER
- **Function success**: 70%+ multi-turn with GPT-4o

### Testing Workflow

1. Test in LLM Playground with sample scenarios
2. Use Simulation Testing for edge cases
3. Monitor call history for latency, errors
4. Review post-call analysis accuracy
5. Iterate based on real performance data

## Troubleshooting Common Issues

**High Latency:**

- Check TTS provider status (switch to fallback if needed)
- Reduce function execution time
- Optimize knowledge base queries
- Review MCP endpoint response times

**Interruption Problems:**

- Adjust interruption_sensitivity based on environment
- Office: 0.6-0.7, Quiet: 0.8-0.9
- Lower if agent talks over user
- Raise if agent doesn't respond to interruptions

**Transcription Errors:**

- Add boosted keywords for common terms
- Toggle transcript formatting for number issues
- Switch to accuracy mode if needed
- Review language setting

**Function Failures:**

- Verify signature validation working
- Check execution time (<5 seconds)
- Review error logs in call history
- Test endpoint independently

**Knowledge Base Issues:**

- Verify content is in Markdown format
- Check section structure (clear ## headings)
- Test retrieval in LLM Playground
- Review auto-refresh/crawl settings

## Detailed Configuration Reference

For comprehensive details on each setting category, see:

- [CONFIGURATION_REFERENCE.md](references/CONFIGURATION_REFERENCE.md) - Complete settings guide with examples and code snippets

## Quick Start Checklist

**New agent setup:**

- [ ] Define agent purpose and use case
- [ ] Configure core speech settings (responsiveness, interruption)
- [ ] Set up voice with fallback providers
- [ ] Add knowledge base (if needed)
- [ ] Configure functions/integrations (if needed)
- [ ] Set transcription mode and boosted keywords
- [ ] Configure call behavior (duration, DTMF, etc.)
- [ ] Define post-call analysis fields
- [ ] Enable security features (PII redaction, compliance)
- [ ] Set up webhooks (if needed)
- [ ] Configure MCP integrations (if needed)
- [ ] Test thoroughly in playground
- [ ] Monitor initial production calls
- [ ] Iterate based on performance

**Security checklist:**

- [ ] PII redaction enabled for appropriate data types
- [ ] Fallback voices from different providers configured
- [ ] Webhook signature verification implemented
- [ ] Data storage settings configured
- [ ] Role-based access controls set
- [ ] Compliance features enabled (HIPAA BAA if needed)
- [ ] Maximum call duration set
- [ ] Security logs monitored

## Best Practice Summary

**Always:**

- Set fallback voices from different TTS providers
- Verify webhook signatures
- Keep function execution under 5 seconds
- Use Markdown for knowledge base content
- Test in playground before production
- Monitor call history and analytics
- Enable PII redaction for sensitive data

**Never:**

- Block webhook handlers with long operations
- Exceed 5-second webhook timeout
- Store unredacted sensitive data without compliance
- Deploy without testing edge cases
- Ignore latency metrics
- Skip fallback configuration

**Consider:**

- Responsiveness tuning for target audience
- Interruption sensitivity for call environment
- Knowledge base segmentation strategy
- Post-call analysis automation opportunities
- MCP for complex integrations
- Multiple agents for different use cases
