#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path


def run_command(command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, cwd=cwd, text=True, capture_output=True)


def extract_deployment_url(stdout: str) -> str:
    urls = re.findall(r"https://[^\s]+", stdout)
    if not urls:
        raise ValueError("Vercel deploy did not print a production URL.")
    return urls[-1].strip()


def smoke_test(url: str) -> list[str]:
    failures: list[str] = []
    try:
        with urllib.request.urlopen(url, timeout=20) as response:
            html = response.read().decode("utf-8", errors="replace")
            if response.status != 200:
                failures.append(f"Production URL returned HTTP {response.status}")
            if 'name="viewport"' not in html:
                failures.append("Production HTML missing viewport meta")
    except Exception as exc:
        failures.append(f"Production URL fetch failed: {exc}")

    data_url = url.rstrip("/") + "/assets/js/travel-data.js"
    try:
        with urllib.request.urlopen(data_url, timeout=20) as response:
            response.read()
            if response.status != 200:
                failures.append(f"travel-data.js returned HTTP {response.status}")
    except Exception as exc:
        failures.append(f"travel-data.js fetch failed: {exc}")

    return failures


def deploy(project: Path, dry_run: bool) -> tuple[int, dict]:
    commands = [
        "vercel --version",
        "vercel whoami",
        "vercel link --yes",
        "vercel deploy --prod --yes",
    ]
    result: dict = {
        "ok": False,
        "dry_run": dry_run,
        "project_path": str(project),
        "commands": commands,
        "stage": "not-started",
        "deployment_url": "",
        "smoke_failures": [],
    }

    if not project.exists():
        result["stage"] = "project-missing"
        result["error"] = f"Project folder does not exist: {project}"
        return 1, result

    if dry_run:
        result["ok"] = True
        result["stage"] = "dry-run"
        return 0, result

    if shutil.which("vercel") is None:
        result["stage"] = "vercel-cli-missing"
        result["error"] = "Vercel CLI is not installed."
        return 1, result

    version = run_command(["vercel", "--version"], project)
    if version.returncode != 0:
        result["stage"] = "version"
        result["error"] = version.stderr.strip() or version.stdout.strip()
        return 1, result

    whoami = run_command(["vercel", "whoami"], project)
    if whoami.returncode != 0:
        result["stage"] = "whoami"
        result["error"] = whoami.stderr.strip() or "Run vercel login before deploying."
        return 1, result

    if not (project / ".vercel/project.json").exists():
        link = run_command(["vercel", "link", "--yes"], project)
        if link.returncode != 0:
            result["stage"] = "link"
            result["error"] = link.stderr.strip() or link.stdout.strip()
            return 1, result

    prod = run_command(["vercel", "deploy", "--prod", "--yes"], project)
    if prod.returncode != 0:
        result["stage"] = "deploy"
        result["error"] = prod.stderr.strip() or prod.stdout.strip()
        return 1, result

    try:
        url = extract_deployment_url(prod.stdout)
    except Exception as exc:
        result["stage"] = "deploy-output"
        result["error"] = str(exc)
        return 1, result

    result["deployment_url"] = url
    result["stage"] = "smoke-test"
    failures = smoke_test(url)
    result["smoke_failures"] = failures
    result["ok"] = not failures
    return (0 if result["ok"] else 1), result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Deploy a generated Happy Trip Site to Vercel production.")
    parser.add_argument("project", type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)
    project = args.project.expanduser().resolve()
    code, data = deploy(project, args.dry_run)
    (project / "deployment-result.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if data.get("deployment_url"):
        print(data["deployment_url"])
    elif args.dry_run:
        print("dry run passed")
    if code != 0:
        print(data.get("error") or "; ".join(data.get("smoke_failures", [])), file=sys.stderr)
    return code


if __name__ == "__main__":
    raise SystemExit(main())
