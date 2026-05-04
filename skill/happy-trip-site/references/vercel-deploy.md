# Vercel Deployment

Use the official Vercel CLI. Do not implement a custom deployment API.

## Command Flow

```bash
vercel --version
vercel whoami
vercel link --yes
vercel deploy --prod --yes
```

## Rules

- Run from the generated site folder.
- If `.vercel/project.json` exists, skip `vercel link --yes`.
- If `vercel` is missing, stop and ask the user to install the Vercel CLI.
- If `vercel whoami` fails, stop and ask the user to run `vercel login`.
- Capture deployment stdout because Vercel CLI writes the deployment URL to stdout.
- Smoke test the production URL before claiming completion.

## Smoke Test

After deploy:

- Fetch the production URL and require HTTP 200.
- Check the HTML contains `name="viewport"`.
- Fetch `/assets/js/trip-data.js` and require HTTP 200.
- Write `deployment-result.json` in the generated folder.
