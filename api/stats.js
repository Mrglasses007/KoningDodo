import { readBets } from "./githubStorage.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Alleen GET toegestaan" });
    return;
  }

  try {
    const bets = await readBets();
    const stats = {};

    bets.forEach((b) => {
      const user = b.user || "Onbekend";
      if (!stats[user]) stats[user] = { totalBets: 0, wins: 0, losses: 0, profit: 0 };

      stats[user].totalBets += 1;

      if (b.status === "win") {
        stats[user].wins += 1;
        stats[user].profit += b.stake * b.odds;
      } else if (b.status === "loss") {
        stats[user].losses += 1;
        stats[user].profit -= b.stake;
      }
    });

    res.status(200).json({ ok: true, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon stats niet laden" });
  }
}
