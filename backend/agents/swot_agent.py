from state import AgentState
from llm_client import chat

def swot_agent(state: AgentState) -> AgentState:
    sales    = state.get("sales_insights", "")
    feedback = state.get("feedback_insights", "")

    prompt = f"""You are a business strategist. Based on the sales analysis and customer feedback below,
generate a comprehensive SWOT analysis.

SALES ANALYSIS:
{sales}

CUSTOMER FEEDBACK ANALYSIS:
{feedback}

Generate a detailed SWOT analysis:

STRENGTHS (internal positives):
- List 4-5 specific strengths with data backing

WEAKNESSES (internal negatives):
- List 4-5 specific weaknesses with data backing

OPPORTUNITIES (external positives):
- List 4-5 opportunities based on the data

THREATS (external negatives):
- List 4-5 threats or risks identified

Be specific and tie each point back to the data provided."""

    result = chat(prompt, system="You are an expert business strategist specializing in SWOT analysis.")
    state["swot_analysis"] = result
    return state
