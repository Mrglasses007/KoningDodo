// api/bets.js
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'bets.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { bettorName, inzet, bets, totalOdds } = req.body;

    if (!bettorName || !inzet || !bets || bets.length === 0) {
      return res.status(400).json({ ok: false, error: "Missing data" });
    }

    // Lees bestaande bets
    let existingBets = [];
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      existingBets = JSON.parse(raw);
    }

    // Voeg nieuwe bet toe
    const newBet = { bettorName, inzet, bets, totalOdds, timestamp: Date.now() };
    existingBets.push(newBet);

    // Schrijf terug naar opslag
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(existingBets, null, 2));

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Bets API error:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
