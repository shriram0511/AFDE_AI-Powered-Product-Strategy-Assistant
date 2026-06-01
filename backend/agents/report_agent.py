import os
import re
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from state import AgentState

REPORTS_DIR = "./reports"

def _clean_markdown(text: str) -> str:
    # Convert **bold** to <b>bold</b> for ReportLab
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    # Remove remaining single * italic markers
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    # Remove backticks
    text = text.replace('`', '')
    return text

def _add_section(story, styles, title: str, content: str):
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(title, styles["section"]))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#4A90D9")))
    story.append(Spacer(1, 0.1 * inch))

    for line in content.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 0.05 * inch))
            continue

        # Strip markdown heading symbols → subsection style
        if line.startswith("####"):
            line = _clean_markdown(line.lstrip("#").strip())
            story.append(Paragraph(line, styles["subsection"]))
        elif line.startswith("###"):
            line = _clean_markdown(line.lstrip("#").strip())
            story.append(Paragraph(line, styles["heading"]))
        elif line.startswith("##"):
            line = _clean_markdown(line.lstrip("#").strip())
            story.append(Paragraph(line, styles["heading"]))
        # Bullet lines
        elif line.startswith(("- ", "• ", "* ")):
            line = _clean_markdown(line[2:].strip())
            story.append(Paragraph(f"• {line}", styles["bullet"]))
        # Numbered list
        elif re.match(r'^\d+\.', line):
            line = _clean_markdown(line)
            story.append(Paragraph(line, styles["numbered"]))
        # Regular body
        else:
            line = _clean_markdown(line)
            story.append(Paragraph(line, styles["body"]))

def report_agent(state: AgentState) -> AgentState:
    os.makedirs(REPORTS_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pdf_path  = os.path.join(REPORTS_DIR, f"product_strategy_report_{timestamp}.pdf")

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    base   = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle("title", parent=base["Title"],
                                fontSize=22, textColor=colors.HexColor("#1A3C5E"),
                                spaceAfter=6),
        "subtitle": ParagraphStyle("subtitle", parent=base["Normal"],
                                   fontSize=11, textColor=colors.HexColor("#4A90D9"),
                                   spaceAfter=4),
        "section": ParagraphStyle("section", parent=base["Heading1"],
                                  fontSize=14, textColor=colors.HexColor("#1A3C5E"),
                                  spaceBefore=14, spaceAfter=4),
        "heading": ParagraphStyle("heading", parent=base["Heading2"],
                                  fontSize=12, textColor=colors.HexColor("#1e40af"),
                                  spaceBefore=10, spaceAfter=3),
        "subsection": ParagraphStyle("subsection", parent=base["Normal"],
                                     fontSize=11, textColor=colors.HexColor("#2E6DA4"),
                                     spaceBefore=6, spaceAfter=2, fontName="Helvetica-Bold"),
        "body": ParagraphStyle("body", parent=base["Normal"],
                               fontSize=10, leading=15, spaceAfter=3),
        "bullet": ParagraphStyle("bullet", parent=base["Normal"],
                                 fontSize=10, leading=14, leftIndent=20, spaceAfter=2),
        "numbered": ParagraphStyle("numbered", parent=base["Normal"],
                                   fontSize=10, leading=14, leftIndent=16, spaceAfter=2),
    }

    story = []

    # Cover page
    story.append(Spacer(1, 0.6 * inch))
    story.append(Paragraph("AI-Powered Product Strategy Report", styles["title"]))
    story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')}", styles["subtitle"]))
    story.append(Spacer(1, 0.1 * inch))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1A3C5E")))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("Confidential · For Internal Use Only", ParagraphStyle(
        "footer", parent=base["Normal"], fontSize=9,
        textColor=colors.HexColor("#94a3b8"), spaceAfter=4
    )))
    story.append(Spacer(1, 0.3 * inch))

    sections = [
        ("1. Sales Performance Analysis",   state.get("sales_insights",         "No data available.")),
        ("2. Customer Feedback Analysis",   state.get("feedback_insights",       "No data available.")),
        ("3. SWOT Analysis",                state.get("swot_analysis",           "No data available.")),
        ("4. Feature Prioritization",       state.get("feature_priorities",      "No data available.")),
        ("5. Strategic Recommendations",    state.get("strategy_recommendations","No data available.")),
    ]

    for title, content in sections:
        _add_section(story, styles, title, content)

    doc.build(story)
    state["pdf_path"] = pdf_path
    return state
