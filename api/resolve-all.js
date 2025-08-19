import { readBets, writeBets } from "./githubStorage.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    let bets = await readBets();

    // Alle open bets als "resolved" markeren (voorbeeld)
    bets = bets.map(bet => {
      if (!bet.status) {
        bet.status = "resolved"; // kan ook "win" of "loss" zijn als je wilt random of calculatie
      }
      return bet;
    });

    await writeBets(bets);

    res.json({ ok: true, bets });
  } catch (err) {
    console.error("Fout in resolve-all:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
