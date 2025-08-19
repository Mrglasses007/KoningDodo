// api/stats.js
import { getFile } from "./githubStorage.js";

const token = process.env.GH_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const filePath = process.env.DATA_PATH || "api/bets.json";

export default async function handler(req, res) {
  try {
    const bets = await getFile(owner, repo, filePath, token);

    // stats per speler
    const stats = {};

    bets.forEach(bet => {
      const user = bet.user;
      if (!stats[user]) stats[user] = { totalBets: 0, wins: 0, losses: 0, profit: 0 };
      stats[user].totalBets += 1;

      if (bet.status === "win") {
        stats[user].wins += 1;
        stats[user].profit += bet.stake * (bet.odds - 1);
      } else if (bet.status === "loss") {
        stats[user].losses += 1;
        stats[user].profit -= bet.stake;
      }
    });

    res.status(200).json({ ok: true, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

