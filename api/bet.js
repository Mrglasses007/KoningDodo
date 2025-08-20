import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { saveBet } from './githubStorage.js';

const STORAGE_FILE = path.join(process.cwd(), 'bets.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { bettorName, inzet, bets, totalOdds } = req.body;
    if (!bettorName || !bets || bets.length === 0) {
      return res.status(400).json({ error: 'Ongeldige data' });
    }

    // Verstuur naar Discord webhook
    const webhookURL = process.env.DISCORD_WEBHOOK;
    const payload = {
      username: "Koning Dodo",
      embeds: [{
        title: "Nieuwe weddenschap",
        description: `**Wedder:** ${bettorName}\n**Inzet:** €${inzet}\n**Totaal Odds:** ${totalOdds.toFixed(2)}\n\n**Weddenschappen:**\n${bets.map(b => `- ${b.match.home_team} - ${b.match.away_team}: ${b.outcome.name} (${b.odds.toFixed(2)})`).join("\n")}`,
        color: 5763719,
        timestamp: new Date().toISOString()
      }]
    };

    const discordRes = await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!discordRes.ok) throw new Error('Discord webhook error');

    // Sla bet lokaal op via githubStorage
    await saveBet({ bettorName, inzet, bets, totalOdds, status: 'open', timestamp: Date.now() });

    // Sla bet ook lokaal op in bets.json
    let existingBets = [];
    if (fs.existsSync(STORAGE_FILE)) {
      existingBets = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf-8'));
    }

    const newBet = { bettorName, inzet, bets, totalOdds, status: 'open', timestamp: Date.now() };
    existingBets.push(newBet);
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(existingBets, null, 2));

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
