import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const path = "bets.json"; // bestand in je repo waar alle bets in staan

// Bets uitlezen
export async function readBets() {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    if (err.status === 404) return [];
    console.error("Fout bij lezen van bets van GitHub:", err);
    throw err;
  }
}

// Bets schrijven
export async function writeBets(bets) {
  try {
    let sha;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path });
      sha = data.sha; // nodig voor update
    } catch (err) {
      if (err.status !== 404) throw err;
      // bestand bestaat nog niet, sha blijft undefined
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Update bets",
      content: Buffer.from(JSON.stringify(bets, null, 2)).toString("base64"),
      sha,
    });
  } catch (err) {
    console.error("Fout bij schrijven van bets naar GitHub:", err);
    throw err;
  }
}
