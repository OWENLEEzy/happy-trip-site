# Agent Usage

This repository packages one installable skill at `skill/happy-trip-site`.

For Codex, install or copy that folder into `~/.codex/skills/happy-trip-site`.
For Claude Code, install or copy the same folder into `~/.claude/skills/happy-trip-site`.
For Lobster/龙虾 or other agents, read `skill/happy-trip-site/SKILL.md` first, then load only the referenced files needed for the current step.

Core behavior to preserve:

- Ask for missing trip details before generating or deploying.
- Generate a static mobile-first site from a Trip Brief.
- Keep every important guide reference as a visible tappable link in the generated page.
- Validate with `python3 skill/happy-trip-site/scripts/validate_site.py <generated-site>` before claiming completion.
