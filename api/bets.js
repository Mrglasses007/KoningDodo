import { readBets, writeBets } from './githubStorage';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { bettorName, inzet, bets, totalOdds } = req.body;
      if (!bettorName || !inzet || !bets || bets.length === 0) {
        return res.status(400).json({ ok: false, error: "Missing data" });
      }

      // Bestaande bets uitlezen van GitHub
      let existingBets = await readBets();

      // Nieuwe bet toevoegen
      const newBet = {
        bettorName,
        inzet,
        bets,
        totalOdds,
        timestamp: Date.now(),
        status: "open"
      };
      existingBets.push(newBet);

      // Bets opslaan naar GitHub
      await writeBets(existingBets);

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("POST /api/bets error:", err);
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  } else if (req.method === 'GET') {
    try {
      // Bets uitlezen van GitHub
      let existingBets = await readBets();

      // Converteer naar admin-formaat
      const betsForAdmin = existingBets.flatMap(bet =>
        bet.bets.map(pick => ({
          user: bet.bettorName,
          pick,
          stake: bet.inzet,
          odds: bet.totalOdds,
          status: bet.status || "open"
        }))
      );

      res.status(200).json({ ok: true, bets: betsForAdmin });
    } catch (err) {
      console.error("GET /api/bets error:", err);
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  } else {
    res.status(405).json({ ok: false, error: "Method not allowed" });
  }
}
