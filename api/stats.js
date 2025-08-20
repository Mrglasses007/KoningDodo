// api/stats.js
import { readBets } from './githubStorage';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Bets uitlezen van GitHub
    const bets = await readBets();

    const stats = {};

    bets.forEach(bet => {
      const user = bet.bettorName;
      if (!stats[user]) {
        stats[user] = { totalBets: 0, wins: 0, losses: 0, profit: 0 };
      }
      stats[user].totalBets += 1;

      if (bet.status === 'resolved' && bet.result) {
        if (bet.result === 'win') {
          stats[user].wins += 1;
          stats[user].profit += bet.totalOdds * bet.inzet - bet.inzet;
        } else if (bet.result === 'lose') {
          stats[user].losses += 1;
          stats[user].profit -= bet.inzet;
        }
      }
    });

    res.status(200).json({ ok: true, stats });
  } catch (err) {
    console.error("Stats API error:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
