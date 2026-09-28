"""Logic 101 workflow nodes.

Stage 1A (theory) — always run:
- a1_researcher.py  (A1)  — LLM + tools (web search)
- a2_outliner.py    (A2)  — LLM only
- a3_writer.py      (A3)  — LLM only, gọi parallel 6 lần
- a4_consistency.py (A4)  — LLM only
- a5_critic.py      (A5)  — LLM + code pre-check
- a6_assemble.py    (A6)  — Pure code, no LLM

Stage 1B (practice) — conditional (chạy nếu practice_required: true):
- b1_question_designer.py   (B1)  — LLM only
- b2_question_generator.py  (B2)  — LLM only, parallel ×3 tier
- b3_practice_critic.py     (B3)  — LLM + code pre-check (deep mirror A5)
- b4_practice_assemble.py   (B4)  — Pure code, no LLM

V1 (prototype trong Claude Code): node functions là stub, orchestrator chạy
trong Claude Code session sẽ spawn Agent subagents với prompt từ ../prompts/.

V2 (production via Agent SDK): fill in actual Anthropic API call trong từng node.
"""
