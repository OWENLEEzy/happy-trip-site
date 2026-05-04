# Claude Code Notes

The reusable skill lives at `skill/happy-trip-site`.

To use it as a Claude Code skill, install or copy that folder to `~/.claude/skills/happy-trip-site`. When working from this repo directly, follow `skill/happy-trip-site/SKILL.md` and its referenced schema/extraction/deployment files.

Do not generate or deploy a trip site until the Trip Brief readiness gate passes and the user confirms. The generated mobile page must expose route and itinerary references as tappable links, not only as prose.
