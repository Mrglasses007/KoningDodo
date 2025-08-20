// api/bets.js
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'bets.json');

export default async function handler(req, res) {
  try {
    // POST: nieuwe bet toevoegen
    if (req.method === 'POST') {
      const { bettorName, inzet, bets, totalOdds } = req.body;
      if (!bettorName || !inzet || !bets || bets.length === 0) {
        return res.status(400).json({ ok: false, error: "Missing data" });
      }

      let existingBets = [];
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        existingBets = JSON.parse(raw);
      }

      const newBet = {
        user: bettorName,
        pick: bets.map(b => b.pick).join(", "),
        stake: inzet,
        odds: totalOdds,
        status: "open",
        timestamp: Date.now()
      };

      existingBets.push(newBet);
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(existingBets, null, 2));

      return res.status(200).json({ ok: true });
    }

    // GET: alle bets ophalen (voor admin)
    if (req.method === 'GET') {
      let existingBets = [];
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        existingBets = JSON.parse(raw);
      }
      return res.status(200).json({ ok: true, bets: existingBets });
    }

    // Andere methodes niet toegestaan
    res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err) {
    console.error("Bets API error:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
