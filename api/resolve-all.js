import fetch from "node-fetch";
import { getBets, saveBets } from "./githubStorage.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const bets = await getBets();
    let updated = false;

    const resolvedBets = bets.map(bet => {
      if (bet.status === "open") {
        // Hier bepaal je de uitkomst. Voor demo: 50% kans winnen/verliezen
        const outcome = Math.random() < 0.5 ? "won" : "lost";
        updated = true;
        return { ...bet, status: outcome };
      }
      return bet;
    });

    if (updated) {
      await saveBets(resolvedBets);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error resolving bets:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
