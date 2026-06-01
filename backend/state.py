from typing import TypedDict, Optional

class AgentState(TypedDict):
    csv_path: str
    sales_insights: Optional[str]
    feedback_insights: Optional[str]
    swot_analysis: Optional[str]
    feature_priorities: Optional[str]
    strategy_recommendations: Optional[str]
    executive_summary: Optional[str]
    pdf_path: Optional[str]
    error: Optional[str]
