from state import AgentState
from ingest import query_collection
from llm_client import chat

def sales_agent(state: AgentState) -> AgentState:
    docs = query_collection("revenue profit units sold product performance region", n_results=20)
    context = "\n".join(docs)

    prompt = f"""You are a sales analyst. Analyze the following sales data and provide insights.

Sales Data:
{context}

Provide a structured analysis with:
1. Top 3 performing products (by revenue)
2. Bottom 3 performing products
3. Best performing region
4. Worst performing region
5. Products with highest return rates
6. Marketing spend efficiency (which products give best ROI)
7. Overall revenue and profit summary

Be specific with numbers from the data."""

    result = chat(prompt, system="You are an expert sales analyst providing data-driven insights.")
    state["sales_insights"] = result
    return state
