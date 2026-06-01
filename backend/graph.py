from langgraph.graph import StateGraph, END
from state import AgentState
from agents.sales_agent    import sales_agent
from agents.feedback_agent import feedback_agent
from agents.swot_agent     import swot_agent
from agents.feature_agent  import feature_agent
from agents.strategy_agent import strategy_agent
from agents.report_agent   import report_agent

def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("sales_agent",    sales_agent)
    graph.add_node("feedback_agent", feedback_agent)
    graph.add_node("swot_agent",     swot_agent)
    graph.add_node("feature_agent",  feature_agent)
    graph.add_node("strategy_agent", strategy_agent)
    graph.add_node("report_agent",   report_agent)

    graph.set_entry_point("sales_agent")
    graph.add_edge("sales_agent",    "feedback_agent")
    graph.add_edge("feedback_agent", "swot_agent")
    graph.add_edge("swot_agent",     "feature_agent")
    graph.add_edge("feature_agent",  "strategy_agent")
    graph.add_edge("strategy_agent", "report_agent")
    graph.add_edge("report_agent",   END)

    return graph.compile()

pipeline = build_graph()

def run_pipeline(csv_path: str) -> AgentState:
    initial_state: AgentState = {
        "csv_path":               csv_path,
        "sales_insights":         None,
        "feedback_insights":      None,
        "swot_analysis":          None,
        "feature_priorities":     None,
        "strategy_recommendations": None,
        "executive_summary":      None,
        "pdf_path":               None,
        "error":                  None,
    }
    return pipeline.invoke(initial_state)
