from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skill" / "happy-trip-site"


class SkillContractTest(unittest.TestCase):
    def test_skill_mentions_readiness_gate_before_generation(self):
        text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn("Do not create files", text)
        self.assertIn("Readiness Checklist", text)
        self.assertIn("explicitly confirms generation", text)

    def test_references_exist_and_are_linked(self):
        skill_text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        for name in ["itinerary-schema.md", "extraction-rules.md", "vercel-deploy.md"]:
            self.assertIn(f"references/{name}", skill_text)
            self.assertTrue((SKILL / "references" / name).exists(), name)

    def test_frontmatter_name_is_valid(self):
        text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        match = re.search(r"^name:\s*(.+)$", text, re.MULTILINE)
        self.assertIsNotNone(match)
        self.assertEqual(match.group(1).strip(), "happy-trip-site")

    def test_mobile_link_contract_is_documented_for_agents(self):
        skill_text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        schema_text = (SKILL / "references" / "itinerary-schema.md").read_text(encoding="utf-8")
        self.assertIn("Mobile Link Contract", skill_text)
        self.assertIn("visible link pill", skill_text)
        self.assertIn("routeOverview.stops", schema_text)

    def test_ui_preview_and_media_gate_is_documented_for_agents(self):
        skill_text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        schema_text = (SKILL / "references" / "itinerary-schema.md").read_text(encoding="utf-8")
        extraction_text = (SKILL / "references" / "extraction-rules.md").read_text(encoding="utf-8")

        self.assertIn("UI Brief", skill_text)
        self.assertIn("create_ui_previews.py", skill_text)
        self.assertIn("Media Brief", skill_text)
        self.assertIn("confirmed_option_id", schema_text)
        self.assertIn("hero_treatment", schema_text)
        self.assertIn("map_treatment", schema_text)
        self.assertIn("selected_asset_id", schema_text)
        self.assertIn("不使用占位符", extraction_text)
        self.assertIn("真实图片", extraction_text)

    def test_delegated_autonomy_records_ui_choices(self):
        skill_text = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        extraction_text = (SKILL / "references" / "extraction-rules.md").read_text(encoding="utf-8")

        self.assertIn("Delegation does not hide UI decisions", skill_text)
        self.assertIn("complete UI Brief", skill_text)
        self.assertIn("自己决定", extraction_text)
        self.assertIn("用推荐默认", extraction_text)

    def test_readme_documents_ui_and_media_cli_inputs(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn("--ui-brief", readme)
        self.assertIn("--media-brief", readme)
        self.assertIn("ui-brief.json", readme)
        self.assertIn("create_ui_previews.py", readme)
        self.assertIn("media-manifest.json", readme)

    def test_cross_agent_entrypoints_exist(self):
        agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
        claude = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
        self.assertIn("~/.codex/skills/happy-trip-site", agents)
        self.assertIn("~/.claude/skills/happy-trip-site", agents)
        self.assertIn("Lobster/龙虾", agents)
        self.assertIn("skill/happy-trip-site/SKILL.md", claude)


if __name__ == "__main__":
    unittest.main()
