from state import AgentState
from llm_client import chat

def strategy_agent(state: AgentState) -> AgentState:
    sales      = state.get("sales_insights", "")
    feedback   = state.get("feedback_insights", "")
    swot       = state.get("swot_analysis", "")
    features   = state.get("feature_priorities", "")

    prompt = f"""You are a Chief Product Officer. Based on all analysis below,
generate a comprehensive product strategy.

SALES ANALYSIS:
{sales}

CUSTOMER FEEDBACK:
{feedback}

SWOT ANALYSIS:
{swot}

FEATURE PRIORITIES:
{features}

Generate:
1. STRATEGIC RECOMMENDATIONS (5-7 actionable recommendations)
2. 90-DAY ACTION PLAN (what to do in next 3 months, week by week)
3. PRODUCT ROADMAP (6-month roadmap with milestones)
4. KEY METRICS TO TRACK (5 KPIs to monitor progress)
5. EXECUTIVE SUMMARY (3-4 paragraph summary for leadership)

Be specific, actionable, and data-driven."""

    result = chat(prompt, system="You are an expert Chief Product Officer with 15 years experience.")
    state["strategy_recommendations"] = result
    return state
