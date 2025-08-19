// api/resolve-all.js
import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'bets.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return res.status(200).json({ ok: true, message: "No bets to resolve" });
    }

    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    const bets = JSON.parse(raw);

    // Voorbeeld: alle bets als 'resolved' markeren (hier kun je echte logica toevoegen)
    const resolvedBets = bets.map(bet => ({
      ...bet,
      status: 'resolved',
      resolvedAt: Date.now()
    }));

    // Opslaan
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(resolvedBets, null, 2));

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resolve-all API error:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
