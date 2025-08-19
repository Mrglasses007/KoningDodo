import fetch from "node-fetch";
import { getBets, saveBets } from "./githubStorage.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const { bettorName, inzet, bets, totalOdds } = req.body;

    if (!bettorName || !bets || !totalOdds || !inzet) {
      res.status(400).json({ ok: false, error: "Invalid payload" });
      return;
    }

    const storedBets = await getBets();

    const newBets = bets.map(bet => ({
      user: bettorName,
      pick: `${bet.match.home_team} - ${bet.match.away_team}: ${bet.outcome.name}`,
      stake: inzet,
      odds: bet.odds,
      status: "open",
      timestamp: new Date().toISOString()
    }));

    await saveBets([...storedBets, ...newBets]);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error saving bet:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
