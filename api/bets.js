import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'bets.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { bettorName, inzet, bets, totalOdds } = req.body;
      if (!bettorName || !inzet || !bets || bets.length === 0) {
        return res.status(400).json({ ok: false, error: "Missing data" });
      }

      let existingBets = [];
      if (fs.existsSync(STORAGE_FILE)) {
        existingBets = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
      }

      const newBet = { bettorName, inzet, bets, totalOdds, timestamp: Date.now(), status: "open" };
      existingBets.push(newBet);
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(existingBets, null, 2));

      res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  } else if (req.method === 'GET') {
    try {
      let existingBets = [];
      if (fs.existsSync(STORAGE_FILE)) {
        existingBets = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
      }

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
      console.error(err);
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  } else {
    res.status(405).json({ ok: false, error: "Method not allowed" });
  }
}
