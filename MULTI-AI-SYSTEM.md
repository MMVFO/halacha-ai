# Intelligent Multi-AI System

## Overview

Halacha AI uses an **intelligent multi-AI routing system** that automatically selects the best AI model for each specific task. Rather than using a single model for everything, the system leverages the unique strengths of different AI providers:

- **Perplexity Sonar**: Web-grounded responses with automatic citations and recent responsa
- **Claude Sonnet**: Deep analytical reasoning and nuanced halakhic analysis
- **GPT-4o**: Balanced responses and reliable fallback

## How It Works

### Automatic Task-Based Routing

When a query is received, the system:

1. **Identifies the task type** based on the search mode
2. **Selects the optimal model** from a prioritized list
3. **Automatically falls back** to alternative providers if the primary fails
4. **Returns sources** even if all AI providers fail (graceful degradation)

### Task-to-Model Mapping

#### Practical Mode (Day-to-Day Halakhic Questions)

**Use Case**: "Can I eat this cheese on Shabbat?", "What bracha do I make?"

**Model Priority**:
1. ✅ **Perplexity Sonar Pro** (Primary)
   - Web-grounded with access to recent responsa
   - Automatic citations from contemporary poskim
   - Cost-effective ($1-3 per 1M tokens)
   - Real-time halakhic discussions

2. 🔶 GPT-4o (Fallback)
   - Fast practical guidance
   - Reliable and balanced

3. 🔶 Claude Sonnet (Fallback)
   - Nuanced practical analysis when needed

**Why This Combination?**
- Practical questions benefit most from recent rulings and contemporary discussions
- Perplexity's web access provides current posek opinions
- Citations build trust and authority

---

#### Deep Analysis Mode (Complex Philosophical Questions)

**Use Case**: "What is the nature of mitzvot in kabbalistic thought?", "Explain the debate on free will in Rishonim"

**Model Priority**:
1. ✅ **Claude Sonnet 4** (Primary)
   - Exceptional analytical reasoning
   - Handles complex philosophical nuances
   - Deep contextual understanding
   - Sophisticated argument synthesis

2. 🔶 Perplexity Reasoning (Fallback)
   - Analytical reasoning with web research
   - Multi-step philosophical analysis

3. 🔶 GPT-4o (Fallback)
   - Comprehensive analysis
   - Reliable synthesis

**Why This Combination?**
- Complex questions require deep reasoning over breadth
- Claude excels at philosophical nuance and multi-layered analysis
- Less need for recent web data in philosophical debates

---

#### Posek View Mode (Authoritative Rulings)

**Use Case**: "What would a posek rule about X?", "Authoritative perspective on Y"

**Model Priority**:
1. ✅ **Claude Sonnet 4** (Primary)
   - Authoritative tone and perspective
   - Careful weighing of sources
   - Nuanced halakhic sensitivity

2. 🔶 Perplexity Sonar Pro (Fallback)
   - Contemporary posek rulings with citations
   - Recent responsa access

3. 🔶 GPT-4o (Fallback)
   - Balanced halakhic perspective

**Why This Combination?**
- Authoritative rulings require careful source analysis
- Claude's reasoning depth matches posek decision-making
- Perplexity provides contemporary posek citations

---

## Configuration

### Recommended Setup

**Option 1: Budget-Friendly (Single Provider)**
```bash
# .env
LLM_PROVIDER=auto
PERPLEXITY_API_KEY=pplx-your_key_here
```

**Cost**: $1-3 per 1M tokens  
**Best For**: Primarily practical queries, cost-conscious deployments  
**Limitation**: No fallback, suboptimal for deep analysis

---

**Option 2: Balanced (Two Providers)**
```bash
# .env
LLM_PROVIDER=auto
PERPLEXITY_API_KEY=pplx-your_key_here
OPENAI_API_KEY=sk-your_key_here
```

**Cost**: ~$1.50-9 per 1M tokens (avg)  
**Best For**: Mixed query types with fallback protection  
**Benefit**: Automatic fallback, reasonable cost

---

**Option 3: Premium (All Three Providers) ⭐ RECOMMENDED**
```bash
# .env
LLM_PROVIDER=auto
PERPLEXITY_API_KEY=pplx-your_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
OPENAI_API_KEY=sk-your_key_here
```

**Cost**: Optimized per task ($1-15 per 1M tokens)  
**Best For**: Production deployments, optimal quality per task  
**Benefit**: 
- Best model for each task automatically
- Two-level fallback protection
- Handles provider outages gracefully
- Cost-optimized (cheap for practical, premium for analysis)

---

### Manual Override

Force a specific provider for all queries:

```bash
# .env
LLM_PROVIDER=perplexity  # or anthropic, or openai
LLM_MODEL=sonar-pro       # or claude-sonnet-4-20250514, or gpt-4o
```

**When to use**: Testing, debugging, or specific provider requirements

---

## Fallback Chain

Example fallback sequence for a **Practical Mode** query:

```
1. Try Perplexity Sonar Pro
   ↓ (fails: insufficient credits)
   
2. Try GPT-4o (first fallback)
   ↓ (fails: API key not set)
   
3. Try Claude Sonnet (second fallback)
   ↓ (fails: rate limit)
   
4. Return sources without AI answer (graceful degradation)
   ✓ User still gets 40 relevant source chunks
```

**Key Feature**: The search *always* works. Even if all AI providers fail, users get relevant sources from the vector database.

---

## Cost Analysis

### By Search Mode (1M tokens processed)

| Mode | Primary Model | Typical Cost | Volume |
|------|--------------|--------------|--------|
| **Practical** | Perplexity Sonar Pro | $1-3 | 60-70% of queries |
| **Deep Analysis** | Claude Sonnet 4 | $3-15 | 20-25% of queries |
| **Posek View** | Claude Sonnet 4 | $3-15 | 10-15% of queries |

### Weighted Average Cost

With optimal routing:
- **Budget Setup** (Perplexity only): $1-3 per 1M tokens
- **Balanced Setup** (Perplexity + OpenAI): $1.50-6 per 1M tokens
- **Premium Setup** (All three): $2-9 per 1M tokens (optimized per task)

### Cost Optimization Tips

1. **Configure Perplexity for all practical queries** (60-70% of volume)
2. **Use Claude only for deep analysis** (premium pricing, premium quality)
3. **Set up all three providers** to avoid expensive fallbacks
4. **Monitor usage** via console logs showing model selection

---

## Benefits

### 1. Optimal Quality Per Task
✓ Web-grounded answers for practical questions  
✓ Deep reasoning for complex analysis  
✓ Authoritative perspective for rulings

### 2. Cost Efficiency
✓ Use cheap models for simple tasks  
✓ Reserve premium models for complex queries  
✓ 60-70% cost reduction vs. always using Claude

### 3. Reliability
✓ Automatic fallback prevents downtime  
✓ Graceful degradation (sources always available)  
✓ Handle provider outages transparently

### 4. Flexibility
✓ Easy to add new providers  
✓ Swap models without code changes  
✓ A/B test different combinations

### 5. Transparency
✓ API responses show which model was used  
✓ Console logs explain model selection  
✓ Error messages suggest optimal providers

---

## Monitoring

### Console Logs

The system logs model selection decisions:

```
[LLM] Using perplexity/sonar-pro for task: practical
[LLM] Using anthropic/claude-sonnet-4-20250514 for task: deep_analysis
[LLM] perplexity failed, trying fallback...
[LLM] Fallback to openai/gpt-4o
```

### API Response

Success responses include model info:

```json
{
  "answer": "...",
  "sources": [...],
  "model_used": {
    "provider": "perplexity",
    "model": "sonar-pro",
    "task_type": "practical"
  },
  "citations": [...],  // Perplexity web citations
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 567
  }
}
```

---

## Troubleshooting

### "No LLM API key configured"

**Solution**: Configure at least one provider in `.env`:
```bash
PERPLEXITY_API_KEY=pplx-your_key_here
```

### "All LLM providers failed for task 'practical'"

**Cause**: All configured providers had errors (credits, rate limits, etc.)  
**Solution**: 
1. Check provider consoles for credit balance
2. Configure additional providers for fallback
3. Users still get sources (graceful degradation)

### "LLM generation failed (insufficient credits)"

**Immediate Fix**: System returns sources without AI answer  
**Long-term Fix**: 
1. Add credits to failing provider
2. Configure alternative providers
3. Switch to Perplexity for cost efficiency

### Suboptimal Model Selection

**Symptoms**: Practical queries using Claude (expensive)  
**Cause**: Perplexity not configured  
**Solution**: Add `PERPLEXITY_API_KEY` to `.env`

---

## Advanced Configuration

### Custom Task Mapping

Edit `packages/lib/llm.ts` to customize task priorities:

```typescript
const TASK_CONFIG: Record<TaskType, ...> = {
  practical: [
    { provider: "perplexity", model: "sonar-pro", ... },
    // Add your custom priority order
  ],
  // ...
};
```

### Force Specific Model for a Query

```typescript
const response = await generate(
  messages,
  { 
    forceProvider: "anthropic",
    forceModel: "claude-sonnet-4-20250514"
  }
);
```

---

## Future Enhancements

- [ ] Dynamic model selection based on query complexity
- [ ] Cost tracking and budgeting per provider
- [ ] A/B testing framework for model comparison
- [ ] User preference for provider priority
- [ ] Multi-model ensemble (combine multiple AI responses)
- [ ] Streaming responses with model switching

---

## Summary

**Key Takeaway**: Configure all three providers for optimal results. The system automatically:
1. Chooses the best model for each task
2. Falls back if primary fails
3. Returns sources even if all AI fails
4. Optimizes cost by using cheaper models for simple tasks

This architecture provides **production-grade reliability** with **optimal quality per task** at the **lowest possible cost**.
