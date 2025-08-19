import { getBets, saveBets } from "./githubStorage.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const bets = await getBets();

    const updatedBets = bets.map(bet => {
      if (bet.status) return bet; // als al resolved, niet opnieuw doen

      // Simuleer resultaat: 50/50 kans
      const won = Math.random() > 0.5;
      return { ...bet, status: won ? "won" : "lost" };
    });

    await saveBets(updatedBets);

    res.status(200).json({ ok: true, message: "Alle bets geresolved." });
  } catch (err) {
    console.error("Error resolving all bets:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
