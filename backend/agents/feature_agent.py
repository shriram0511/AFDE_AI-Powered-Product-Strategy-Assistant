from state import AgentState
from ingest import query_collection
from llm_client import chat

def feature_agent(state: AgentState) -> AgentState:
    docs     = query_collection("low rating returns complaints improve feature quality", n_results=15)
    context  = "\n".join(docs)
    feedback = state.get("feedback_insights", "")
    sales    = state.get("sales_insights", "")

    prompt = f"""You are a product manager. Based on sales data, customer feedback, and reviews,
prioritize product improvements and feature opportunities.

RAW DATA SAMPLE:
{context}

SALES INSIGHTS:
{sales}

FEEDBACK INSIGHTS:
{feedback}

Provide:
1. TOP PRIORITY improvements (must fix immediately) — ranked list with scores out of 10
2. MEDIUM PRIORITY features — ranked list
3. LOW PRIORITY items — ranked list
4. Products to INVEST MORE in (high potential)
5. Products to CONSIDER DISCONTINUING (low performance + bad feedback)
6. Product opportunity scores (score each product 1-10 for investment potential)

Format as clear ranked lists with reasoning."""

    result = chat(prompt, system="You are an expert product manager with deep analytical skills.")
    state["feature_priorities"] = result
    return state
