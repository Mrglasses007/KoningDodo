// api/resolve-all.js
import { readBets, writeBets } from './githubStorage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Bets van GitHub uitlezen
    const bets = await readBets();

    if (bets.length === 0) {
      return res.status(200).json({ ok: true, message: "No bets to resolve" });
    }

    // Voorbeeld: alle bets als 'resolved' markeren
    const resolvedBets = bets.map(bet => ({
      ...bet,
      status: 'resolved',
      resolvedAt: Date.now()
    }));

    // Bets opslaan naar GitHub
    await writeBets(resolvedBets);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resolve-all API error:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
