import { getBets } from "./githubStorage.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const bets = await getBets();

    const stats = {};

    bets.forEach(bet => {
      if (!stats[bet.user]) {
        stats[bet.user] = { totalBets: 0, wins: 0, losses: 0, profit: 0 };
      }
      stats[bet.user].totalBets += 1;

      if (bet.status === "won") {
        stats[bet.user].wins += 1;
        stats[bet.user].profit += bet.stake * bet.odds;
      } else if (bet.status === "lost") {
        stats[bet.user].losses += 1;
        stats[bet.user].profit -= bet.stake;
      }
    });

    res.status(200).json({ ok: true, stats });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
