# Vercel Deployment

Use **Vercel Drop** — drag-and-drop in the browser at `vercel.com/drop`. No CLI, no Node.js, no global installation required.

## Publish Flow

After local validation and the mobile usability gate pass (SKILL.md step 10):

```bash
# 1. Zip a backup first
cd "$HOME/Desktop"
zip -r <trip-slug>-backup.zip <trip-slug>-travel-site/
```

Then tell the user:

> Drag the `~/Desktop/<trip-slug>-travel-site/` folder into **[vercel.com/drop](https://vercel.com/drop)**, pick a team and project name, click Deploy — you'll get a `.vercel.app` link in seconds. Paste the link back here.

Return `package_ready` with the backup zip path until the user provides the URL.

## After User Returns the URL

```bash
curl -sf <deployment-url> | grep -q viewport && echo "smoke-test OK"
curl -sf <deployment-url>/assets/js/travel-data.js -o /dev/null -w "%{http_code}"
```

If both pass, write `deployment-result.json` in the generated folder and return `ready_to_share` with the URL first.

## Rules

- Each Vercel Drop creates a new project — a new URL per trip is expected and correct.
- Always zip the backup before instructing the drop, so the package is preserved regardless of deployment outcome.
- Return `ready_to_share` only after validation, mobile usability, and smoke testing pass. Otherwise return `package_ready` or `blocked`.
- If the user cannot access vercel.com/drop, fall back to providing the backup zip for self-hosting.

## Smoke Test

After user provides the URL:

- Fetch the production URL and require HTTP 200.
- Check the HTML contains `name="viewport"`.
- Fetch `/assets/js/travel-data.js` and require HTTP 200.
- Write `deployment-result.json` in the generated folder.
