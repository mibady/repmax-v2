# Retell AI Settings Best Practices Guide

Comprehensive guide to configuring Retell AI voice agents for optimal performance across all major settings categories.

---

## 1. Functions (Custom Functions & Tool Calling)

### Overview

Functions enable your AI agent to interact with external systems, execute business logic, and take real-world actions during conversations.

### Best Practices

**Function Design**

- Use clear, descriptive function names with underscores (e.g., `book_appointment`, `get_customer_info`)
- Keep function descriptions concise but specific about what the function does
- Define JSON schema parameters precisely to ensure correct data extraction
- Enable "Speak After Execution" when the agent should provide feedback to the user

**Security & Verification**

- Always verify requests using the `X-Retell-Signature` header
- Implement signature verification to confirm requests are from Retell
- Use allowlisting for Retell's IP address (100.20.5.228) for additional security
- Return responses in JSON format for consistency

**Function Calling Strategy**

- GPT-4o achieves 70%+ success rate in multi-turn function calling
- Use function calling for: CRM integrations, appointment booking, data retrieval, workflow triggers
- Explicitly specify in prompts when functions should be invoked
- Handle errors gracefully with fallback responses

**Performance Optimization**

- Keep function execution under 5 seconds to prevent timeouts
- Use async execution for non-blocking operations
- Return minimal but complete response data
- Implement retries for failed function calls (Retell retries up to 3 times)

**Integration Patterns**

- Connect to CRMs (Salesforce, HubSpot, Zendesk)
- Integrate calendaring (Cal.com, Calendly)
- Enable payment processing (Stripe)
- Trigger automation workflows (Zapier, Make, n8n)

---

## 2. Knowledge Base

### Overview

Knowledge bases provide AI agents with contextual information from URLs, documents, and custom text to deliver accurate responses without bloating prompts.

### Best Practices

**Content Structure**

- **Use Markdown (.md) over .txt** - Better chunking and retrieval accuracy
- Use clear, descriptive headings (##, ###)
- Keep each ## section focused and reasonably short
- Split long sections into multiple subsections
- Write short paragraphs and lists to separate concepts
- Avoid walls of text

**Source Management**

- **URL Sources**: Enable auto-refreshing for dynamic content (updates every 24 hours)
- **Auto-Crawling**: Enable for specific URL paths to automatically detect new pages
- **Documents**: Support for .pdf, .docx, .csv, .xlsx, .md, .txt, .html and more
- **Custom Text**: For content not available elsewhere

**Limits & Scaling**

- URL: Max 200 URLs per knowledge base, max 500 with auto-crawling
- Files: Max 25 files, each max 50MB
- CSV/Excel: Max 1000 rows, 50 columns
- **10 free knowledge bases per workspace** ($8/month for additional)
- Create multiple knowledge bases to overcome limits
- Link multiple knowledge bases to a single agent

**Retrieval Optimization**

- Knowledge base triggers automatically - no prompt changes needed
- Uses transcript (not prompt) to find relevant chunks
- For tabular/image content, add explanatory text
- Test retrieval in LLM Playground's Test LLM feature
- Node-specific KB: Assign knowledge bases to specific conversation flow nodes

**Content Segmentation Strategy**

- Segment by department (sales, support, compliance)
- Separate by file type (web content, PDFs, documentation)
- Group by update frequency (static vs. high-change content)
- Organize by equipment/product categories for technical docs

**Pricing**

- $0.005 per minute of knowledge base usage
- Included in standard pricing tiers
- Cost-effective for reducing prompt engineering

---

## 3. Speech Settings

### Overview

Control how your voice agent sounds, responds, and behaves during conversations.

### Best Practices

**Voice Selection & Fallback**

- Select voice from providers: ElevenLabs, PlayHT, OpenAI, Deepgram, Cartesia
- **Set fallback voices from different TTS providers** to handle outages
- System goes through fallback list in order
- Configure voice_temperature (0-2): Lower = stable, Higher = variant (ElevenLabs only)

**Voice Speed & Volume**

- voice_speed (0.5-2): Default 1, adjust for audience (slower for elderly)
- volume (0-2): Control agent speech volume
- Voice speed latency reduced from ~100ms to ~5ms in recent updates

**Responsiveness**

- Range: 0-2, default 1
- **Lower responsiveness = slower agent response** (useful for elderly)
- Reducing by 0.1 adds ~0.5 seconds wait time
- Balance between natural flow and perceived attentiveness

**Interruption Sensitivity**

- Range: 0-2, default 1
- **Lower = more resilient to background noise** (recommended 0.3-0.7 for noisy environments)
- **Higher = faster barge-in** (0.7-0.9 for quiet environments, office needs 0.6-0.7)
- Test with actual environment conditions
- Set to 0.8 for responsive interruptions, 0.3 to prevent agent talking over user

**Backchannel Settings**

- Enable for more human-like active listening
- Frequency: 0-1 (how often agent uses acknowledgments)
- Words: ["yeah", "uh-huh", "mm-hmm", "I see"]
- Shows active listening during user speech

**Background Sound**

- Options: office, coffee-shop, mountain-outdoor, call-center
- Adds ambient noise for more natural, human-like experience
- Volume control: 0-2

**Language & Multilingual**

- 30+ languages supported
- Set language in agent config (e.g., en-US, en-GB, es-ES)
- Use "multi" for multilingual support
- Can create agents that speak multiple languages simultaneously

**Boosted Keywords**

- Bias transcriber toward specific words
- Common use: brand names, people names, product names, street names
- Improves recognition accuracy for domain-specific terms

**Speech Normalization**

- Converts entities (dates, currency, numbers) to plain words
- Helps prevent pronunciation issues
- Ensures TTS generates correct audio

**Pronunciation Control**

- Guide model pronunciation using IPA (International Phonetic Alphabet)
- Example: {"word": "actually", "alphabet": "ipa", "phoneme": "ˈæktʃuəli"}
- Currently API-only (dashboard support coming)

**Voice Model Selection**

- eleven_turbo_v2 for low latency
- Consider newer models (GPT-4o Realtime, OpenAI Realtime API)
- Balance quality, latency, and cost

---

## 4. Realtime Transcription Settings

### Overview

Configure speech-to-text accuracy and latency tradeoffs for optimal conversation flow.

### Best Practices

**Transcription Mode Selection**

- **Optimize for Speed**: Uses latest interim results, low endpointing, minimal latency
- **Optimize for Accuracy**: Higher endpointing, more context, +200ms latency
- **Benchmarking shows similar WER** (Word Error Rate) for both modes
- Choose based on use case priority: speed vs. accuracy

**Boosted Keywords**

- Bias ASR toward specific terms (brands, names, products)
- Improves recognition for domain-specific vocabulary
- Essential for technical/specialized industries

**Word-Level Timestamps**

- Available in transcripts for precise timing
- Useful for analytics and post-call analysis
- Helps with debugging and quality assurance

**Multi-Language Support**

- Set language in agent config (en-US, es-ES, etc.)
- "multi" enables multilingual detection
- ASR adapts to detected language

**Handling Number Transcription**

- Toggle "Disable Transcript Formatting" for number issues
- Prevents phone numbers from being misinterpreted as timestamps
- Improves accuracy for double numbers

**Turn-Taking & Endpointing**

- Proprietary turn-taking model detects end-of-turn
- Recognizes tone shifts, pauses, sentence patterns
- Superior to basic Voice Activity Detection (VAD)
- Prevents premature interruptions

**Real-Time Performance**

- Sub-second delays for natural conversational rhythm
- Filters background noise in real-world settings
- Context-aware transcription for better accuracy
- Industry-specific term recognition

**ASR Provider Selection**

- Deepgram for low latency
- OpenAI Whisper for accuracy
- Consider provider based on language needs

---

## 5. Call Settings

### Overview

Manage call behavior, duration, and flow control parameters.

### Best Practices

**Call Duration Settings**

- **Max Call Duration**: Set in minutes to prevent spam/abuse
- **End Call After Silence**: Auto-terminate after specified silent duration
- Balance between natural pauses and efficiency

**Pause Before Speaking**

- Add delay before AI starts speaking at call start
- Prevents AI talking before user brings phone to ear
- Typical: 1-2 seconds

**Ring Duration**

- How long to wait while ringing before marking unanswered
- B2B contexts may need longer detection (30-45 seconds)
- Consumer contexts: 15-20 seconds

**Voicemail Detection**

- Set duration for detecting voicemail
- Longer detection for B2B with welcome messages
- Prevents leaving messages to voicemail greetings

**User Keypad Input (DTMF)**

- Enable DTMF detection for PIN entry, menu navigation
- Captured in call transcript
- Essential for IVR navigation, verification flows

**IVR Navigation**

- Use Press Digit node in conversation flow
- Navigate multi-level IVR systems automatically
- Handle detection delays to prevent premature triggers

**Reminder Settings**

- reminder_trigger_ms: When to send reminder if user silent
- reminder_max_count: Maximum reminders before action
- Typical: 10000ms trigger, max 2 reminders

**Call Transfer Settings**

- Dynamic Routing: Transfer based on customer requests
- Warm Transfer: Pass context to next agent
- Cold Transfer: Direct handoff
- SIP URI support for custom telephony
- Display caller's number (not Retell number) in transfers

**Latency Targets**

- Target: <500ms for natural conversation
- Sub-second latency critical for user experience
- Monitor TTS and websocket latency in call history

**Ambient Sound**

- Options: office, call-center, coffee-shop
- Makes conversations feel more natural
- Adjust volume as needed

---

## 6. Post-Call Data Extraction

### Overview

Automatically extract insights, data points, and analytics from completed calls.

### Best Practices

**Analysis Types**

- **Boolean Analysis**: Yes/no determinations (e.g., "Did customer request refund?")
- **Text Analysis**: Extract detailed textual information (e.g., customer complaint description)
- **Number Analysis**: Extract numerical values (e.g., order amount, quantity)
- **Selector Analysis**: Categorize from predefined options (e.g., call sentiment: positive/neutral/negative)

**Configuration Steps**

1. Navigate to agent detail page → Post-Call Analysis tab
2. Select analysis type matching your needs
3. Configure description clearly
4. Test with sample calls
5. Integrate via webhooks or API

**Use Cases**

- **Sales**: Buyer intent, objections, pricing discussions, upsell opportunities
- **Support**: Issue type, resolution status, customer satisfaction
- **Compliance**: Regulatory adherence, script compliance, data collection
- **Quality Assurance**: Call quality scores, agent performance metrics

**Webhook Integration**

- Post-call analysis triggers webhooks in real-time
- Data available within seconds of call ending
- Use for automated workflows (CRM updates, ticket creation, follow-ups)
- Payload includes all extracted data points

**Custom Analysis Categories**

- Create custom categories for specific business needs
- Tailor to industry requirements
- Support for multiple categories per call

**Advanced Extraction**

- Extract customer sentiment (positive/negative/neutral/frustrated)
- Identify call outcomes (resolved/escalated/scheduled callback)
- Track compliance metrics
- Measure call quality and agent effectiveness

**Post-Call Automation Examples**

- **Refund Detection**: Boolean flag → Webhook → Stripe refund process → Email confirmation
- **Upsell Opportunity**: Selector value → CRM update → Sales team notification
- **Compliance Risk**: Boolean analysis → Alert to legal team → Call review flagged
- **Customer Satisfaction**: Number score → If <3, escalate to manager

**Analytics & Filtering**

- Filter call history by custom post-call fields
- Support for enum, boolean, number types
- Build dashboards with extracted data
- Track trends over time

**ROI Timeline**

- Month 1: Setup and integration
- Month 2: Fine-tune triggers and automation
- Month 3: Full-scale operation with measurable impact
- Typical ROI positive within 60-90 days

**Best Practice Tips**

- Start with 1-2 high-impact extractions
- Clearly define what to extract in analysis description
- Test thoroughly before production deployment
- Monitor extraction accuracy and adjust prompts
- Combine with webhooks for maximum automation

---

## 7. Security & Fallback Settings

### Overview

Protect sensitive data, ensure compliance, and maintain reliability with redundancy.

### Best Practices

**Data Storage Settings**

- **data_storage_setting options**:
  - "everything": Store all data (transcripts, recordings, logs)
  - "opt_out_sensitive_data_storage": Exclude sensitive data
- **PII Redaction**: Auto-detect and redact sensitive information
  - Names, addresses, DOB, SSN, passwords, PINs, emails
  - Configurable in Security & Fallback Settings
  - Admins can still view for audits

**Compliance Certifications**

- SOC 2 Type I & II certified
- HIPAA compliant (Business Associate Agreement available)
- GDPR compliant (data protection, consent management)
- PCI-DSS support (automatic card data redaction)
- ISO 27001 framework

**Voice Provider Fallbacks**

- **Critical**: Set fallback voices from different TTS providers
- System auto-switches on provider outage
- List is ordered (1st fallback → 2nd fallback → etc.)
- Prevents call failures during TTS provider issues
- Example: Primary = ElevenLabs, Fallback 1 = OpenAI, Fallback 2 = PlayHT

**TTS Failure Handling**

- Two consecutive failed utterances trigger fallback within call
- Monitors provider health in real-time
- Seamless switching maintains call quality

**Webhook Security**

- Verify `X-Retell-Signature` header on all webhook requests
- Use shared secret for authentication
- Allowlist Retell IPs: 13.248.202.14, 3.33.169.178, 100.20.5.228
- Implement timeout handling (5-second response requirement)

**Signed URL Expiration**

- opt_in_signed_url: Enable/disable signed URLs
- signed_url_expiration_minutes: Control expiration time
- Adds security layer for sensitive deployments

**Data Encryption**

- End-to-end encryption for all voice data
- Encryption at rest and in transit
- Industry-standard protocols (TLS/SSL)

**Access Controls**

- **Role-Based Access**: Admin, Developer, Member roles
- Admin: Full control including billing & user management
- Developer: Build/test agents, analytics, settings
- Member: Read-only access
- Implement principle of least privilege

**Call Recording Controls**

- Option to delete call records completely
- Option to remove only recordings/transcripts
- Retention policies configurable
- Support for regulatory compliance requirements

**Network Security**

- Static IP addresses available for enterprise
- Custom SIP integration support
- Private infrastructure connectivity
- VPN/firewall integration support

**Abuse Prevention**

- Google reCAPTCHA on public API keys, chat, call widgets
- Rate limiting per provider
- Calls-per-second caps to prevent toll fraud
- Maximum call duration limits

**Monitoring & Alerting**

- Real-time monitoring of call quality
- Latency tracking (LLM, TTS, websocket)
- Public logs for debugging
- Incident notifications for data breaches

**Disaster Recovery**

- 99.99% uptime SLA
- Automatic failover mechanisms
- Multi-region deployment support
- Regular backup protocols

**Best Practice Checklist**

- [ ] Enable PII redaction for appropriate data types
- [ ] Configure fallback voices from different providers
- [ ] Implement webhook signature verification
- [ ] Set appropriate data storage settings
- [ ] Configure role-based access controls
- [ ] Enable compliance features (HIPAA BAA if needed)
- [ ] Set maximum call duration to prevent abuse
- [ ] Monitor security logs regularly
- [ ] Review and update security settings quarterly

---

## 8. Webhook Settings

### Overview

Enable real-time notifications and event-driven automation for call events.

### Best Practices

**Event Types**

- **call_started**: Triggered when call connects (not triggered for failed dials)
- **call_ended**: Triggered when call completes with full call object
- **call_analyzed**: Post-call analysis completion
- **custom_function**: When custom function is invoked

**Webhook Configuration**

- **Agent-Level vs Account-Level**:
  - Agent-level webhook overrides account-level
  - Set webhook_url in agent config for agent-specific handling
- **Timeout**: Default 10 seconds (configurable via webhook_timeout_ms)
- **Retries**: Up to 3 retries if no 2xx response within timeout
- **Ordering**: Webhooks triggered in order but non-blocking

**Security Implementation**

```javascript
// Verify webhook signature
const verifySignature = (req) => {
  const signature = req.headers["x-retell-signature"];
  const expectedSignature = encrypt(req.body, YOUR_SECRET_KEY);
  return signature === expectedSignature;
};

// Check secret header
if (req.headers["x-webhook-secret"] !== YOUR_SECRET) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

**Response Requirements**

- **Return 200 OK immediately** (within 5 seconds)
- Process heavy operations asynchronously
- Return minimal JSON body to avoid retries
- Never block webhook handler with long operations

**Payload Structure**

```json
{
  "event": "call_ended",
  "call": {
    "call_id": "...",
    "agent_id": "...",
    "transcript": "...",
    "transcript_object": [...],
    "start_timestamp": 1234567890,
    "end_timestamp": 1234567900,
    "disconnection_reason": "user_hangup",
    "metadata": {...},
    "retell_llm_dynamic_variables": {...}
  }
}
```

**Best Practices**

1. **Immediate Response Pattern**:

```javascript
app.post("/webhook/retell", (req, res) => {
  // Acknowledge immediately
  res.json({ received: true });

  // Process asynchronously
  processAsync(req.body);
});
```

2. **Error Handling**:

- Log all webhook payloads before parsing
- Treat unknown fields as optional
- Implement graceful degradation

3. **Idempotency**:

- Use call_id or custom dedupe_key for deduplication
- Prevent duplicate processing in your system
- Store processed webhook IDs

4. **Testing**:

- Use ngrok or similar for local testing
- Test with curl/Postman before production
- Validate payload structure matches expectations
- Test retry behavior

**Integration Patterns**

- **CRM Updates**: Auto-log calls to Salesforce/HubSpot
- **Ticket Creation**: Create support tickets in Zendesk
- **Analytics**: Send data to analytics platforms
- **Automation**: Trigger Zapier/Make workflows
- **Notifications**: Send Slack/email alerts
- **Database Logging**: Store call data in databases

**Common Pitfalls to Avoid**

- ❌ Synchronous processing exceeding 5 seconds
- ❌ Not returning 200 OK immediately
- ❌ Missing signature verification
- ❌ Not handling retries (no idempotency)
- ❌ Blocking on external API calls
- ❌ Not logging for debugging

**Monitoring & Debugging**

- Monitor webhook delivery success rate
- Track processing latency
- Alert on failed webhooks
- Maintain webhook logs for troubleshooting
- Test webhook endpoint health regularly

---

## 9. MCPs (Model Context Protocol)

### Overview

MCP enables standardized connections between voice agents and external tools/APIs, eliminating the N×M integration problem.

### Best Practices

**What is MCP?**

- **Model Context Protocol**: Standardized way for agents to call external tools
- Acts as secure bridge between voice agent and business systems
- Reduces integration complexity from N×M to N+M
- HTTP-based protocol for tool communication

**MCP Node Configuration**

1. Click "+ Add MCP" in agent builder
2. Set MCP Server Endpoint URL
3. Configure authentication (headers, query params)
4. Define request/response mappings
5. Extract values to dynamic variables

**Supported Integrations**

- **CRMs**: Salesforce, HubSpot
- **Scheduling**: Cal.com, Calendly
- **Automation**: Zapier, Make, n8n
- **Databases**: Any HTTP-accessible database
- **Custom APIs**: Internal services, microservices
- **Ticketing**: Zendesk, Jira
- **Payments**: Stripe
- **ID Verification Services**

**Request Configuration**

- **Custom Headers**: Authentication tokens, API keys
- **Query Parameters**: Append to endpoint URL
- **Request Body**: JSON payload with call context
- **Timeout Configuration**: Prevent delays

**Response Handling**

- Extract values from response JSON
- Save as dynamic variables (e.g., `{{user_name}}`)
- Use variables later in conversation
- Handle errors gracefully with fallback prompts

**Latency Optimization**

- Retell maintains sub-second latency even with MCP calls
- Configure appropriate timeouts
- Use async patterns where possible
- Test with production-like loads

**Security Best Practices**

- Use HTTPS endpoints only
- Implement authentication via headers
- Scope access to minimum required permissions
- Validate and sanitize all inputs
- Monitor for unauthorized access

**Testing & Debugging**

- Test full flow in Retell dashboard
- Verify request payloads
- Check response handling
- Log variable extraction
- Test before production deployment

**Prompt Engineering for MCP**

- Explicitly state when to invoke MCP tool in prompt
- Example: "When user provides booking details, call the booking_confirmation tool"
- Provide clear trigger conditions
- Handle tool failures in prompts

**Advanced Patterns**

- **Chained MCP Calls**: Call multiple tools in sequence
- **Conditional Logic**: Call different MCPs based on context
- **Data Transformation**: Process MCP responses before use
- **Fallback Chains**: Primary MCP → Fallback MCP

**MCP Server Implementation**

- Create MCP server for Retell AI integration
- Available for Claude Desktop, Cursor, Windsurf
- Enables AI assistants to make phone calls via Retell
- Examples: RetellAI MCP Server (@abhaybabbar/retellai-mcp-server)

**Example Use Cases**

1. **Customer Lookup**: MCP call to CRM → Extract customer history → Personalize conversation
2. **Appointment Booking**: MCP to calendar → Check availability → Confirm booking → Send confirmation
3. **Order Status**: MCP to order system → Retrieve status → Inform customer
4. **Payment Processing**: MCP to Stripe → Process payment → Confirm transaction

**Node-Specific MCP**

- Assign MCP tools to specific conversation flow nodes
- Context-aware tool calling
- Reduces unnecessary MCP invocations
- Improves conversation flow control

**Monitoring & Analytics**

- Track MCP call success rates
- Monitor response times
- Alert on failures
- Log all MCP interactions
- Analyze tool usage patterns

---

## Additional Resources

### Official Documentation

- [Retell AI Documentation](https://docs.retellai.com)
- [API Reference](https://docs.retellai.com/api-references)
- [Video Tutorials](https://docs.retellai.com/videos/introduction)

### Community & Support

- [Discord Community](https://discord.com/invite/wxtjkjj2zp)
- [Status Page](https://status.retellai.com/)
- [Changelog](https://www.retellai.com/changelog)

### Quick Reference Cheat Sheet

**Critical Settings Summary**

| Category       | Key Setting              | Recommended Value                        |
| -------------- | ------------------------ | ---------------------------------------- |
| Functions      | Response Timeout         | < 5 seconds                              |
| Knowledge Base | File Format              | Markdown (.md)                           |
| Speech         | Interruption Sensitivity | 0.6-0.7 (office), 0.8-0.9 (quiet)        |
| Transcription  | Mode                     | Speed (low latency) or Accuracy (+200ms) |
| Call Settings  | End After Silence        | 10-30 seconds                            |
| Post-Call      | Analysis Types           | Boolean, Text, Number, Selector          |
| Security       | Fallback Voices          | Different providers                      |
| Webhooks       | Response Time            | < 5 seconds (immediate 200 OK)           |
| MCP            | Timeout                  | < 3 seconds for low latency              |

### Performance Targets

- **Latency**: <500ms end-to-end
- **Uptime**: 99.99% SLA
- **Function Execution**: <5 seconds
- **Webhook Response**: <5 seconds
- **Transcription WER**: Industry-leading accuracy

### Compliance Checklist

- [ ] SOC 2 Type II certification reviewed
- [ ] HIPAA BAA signed (if applicable)
- [ ] GDPR compliance configured
- [ ] PII redaction enabled
- [ ] Data retention policies set
- [ ] Access controls implemented
- [ ] Audit logging enabled

---

_Last Updated: January 2026_  
_Based on Retell AI Documentation and Industry Best Practices_
