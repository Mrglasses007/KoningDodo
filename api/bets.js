// api/bets.js
import { getFile } from "./githubStorage.js";

const token = process.env.GH_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const filePath = process.env.DATA_PATH || "api/bets.json";

export default async function handler(req, res) {
  try {
    const bets = await getFile(owner, repo, filePath, token);
    res.status(200).json({ ok: true, bets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

