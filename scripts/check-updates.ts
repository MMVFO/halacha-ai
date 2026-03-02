#!/usr/bin/env tsx
/**
 * Checks Sefaria-Export and Otzaria repos for updates.
 * Run periodically (e.g., weekly cron) or manually to see if new data is available.
 *
 * Usage:
 *   npx tsx scripts/check-updates.ts
 */

import { execFileSync } from "child_process";

interface RepoStatus {
  name: string;
  localPath: string;
  remoteBranch: string;
  localHead: string | null;
  remoteHead: string | null;
  behindBy: number;
  hasUpdates: boolean;
}

const REPOS = [
  {
    name: "Sefaria-Export",
    localPath: process.env.SEFARIA_EXPORT_PATH || "X:/Halacha/Sefaria-Export",
    remote: "https://github.com/Sefaria/Sefaria-Export.git",
    branch: "master",
  },
  {
    name: "Otzaria-Library",
    localPath: "X:/Halacha/otzaria-library",
    remote: "https://github.com/Sivan22/otzaria-library.git",
    branch: "main",
  },
];

function run(cmd: string, args: string[]): string {
  try {
    return execFileSync(cmd, args, { encoding: "utf-8", timeout: 30000 }).trim();
  } catch {
    return "";
  }
}

function checkOtzariaRelease(): { tag: string; date: string } | null {
  try {
    const json = run("gh", [
      "api", "repos/Sivan22/otzaria-library/releases/latest",
      "--jq", '{ tag: .tag_name, date: .published_at }',
    ]);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

async function checkRepo(repo: typeof REPOS[0]): Promise<RepoStatus> {
  const status: RepoStatus = {
    name: repo.name,
    localPath: repo.localPath,
    remoteBranch: repo.branch,
    localHead: null,
    remoteHead: null,
    behindBy: 0,
    hasUpdates: false,
  };

  // Get local HEAD
  status.localHead = run("git", ["-C", repo.localPath, "rev-parse", "HEAD"]);
  if (!status.localHead) {
    console.log(`  ⚠ ${repo.name}: Not cloned or not a git repo at ${repo.localPath}`);
    return status;
  }

  // Fetch remote updates
  run("git", ["-C", repo.localPath, "fetch", "origin", repo.branch, "--quiet"]);

  // Get remote HEAD
  status.remoteHead = run("git", ["-C", repo.localPath, "rev-parse", `origin/${repo.branch}`]);

  if (status.localHead && status.remoteHead && status.localHead !== status.remoteHead) {
    const behindCount = run("git", [
      "-C", repo.localPath, "rev-list", "--count", `HEAD..origin/${repo.branch}`,
    ]);
    status.behindBy = parseInt(behindCount, 10) || 0;
    status.hasUpdates = status.behindBy > 0;
  }

  return status;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Halacha AI — Repository Update Checker");
  console.log(`  ${new Date().toISOString()}`);
  console.log("═══════════════════════════════════════════════════════\n");

  for (const repo of REPOS) {
    console.log(`▸ ${repo.name}`);
    const status = await checkRepo(repo);

    if (status.hasUpdates) {
      console.log(`  🔄 UPDATES AVAILABLE — ${status.behindBy} new commits`);
      console.log(`     Local:  ${status.localHead?.slice(0, 8)}`);
      console.log(`     Remote: ${status.remoteHead?.slice(0, 8)}`);
      console.log(`     Run: git -C "${repo.localPath}" pull origin ${repo.branch}`);
    } else if (status.localHead) {
      console.log(`  ✓ Up to date (${status.localHead.slice(0, 8)})`);
    }
    console.log();
  }

  // Check Otzaria release separately
  console.log("▸ Otzaria Release (ZIP)");
  const release = checkOtzariaRelease();
  if (release) {
    console.log(`  Latest release: ${release.tag} (${release.date})`);
    console.log(`  Download: gh release download latest --repo Sivan22/otzaria-library --dir "X:/Halacha"`);
  } else {
    console.log(`  ⚠ Could not check release`);
  }

  console.log("\n═══════════════════════════════════════════════════════\n");
}

main().catch(console.error);
