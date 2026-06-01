from state import AgentState
from ingest import query_collection
from llm_client import chat

def feedback_agent(state: AgentState) -> AgentState:
    docs = query_collection("customer review rating satisfaction complaint feedback", n_results=20)
    context = "\n".join(docs)

    prompt = f"""You are a customer feedback analyst. Analyze the following customer reviews and ratings.

Customer Feedback Data:
{context}

Provide a structured analysis with:
1. Overall sentiment breakdown (% positive, negative, neutral)
2. Top 5 most common complaints
3. Top 5 most common praises
4. Products with best customer sentiment
5. Products with worst customer sentiment
6. Average rating by product category
7. Key themes from customer feedback

Be specific and quote actual review text where relevant."""

    result = chat(prompt, system="You are an expert customer experience analyst.")
    state["feedback_insights"] = result
    return state
