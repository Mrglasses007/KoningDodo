import fetch from 'node-fetch';
import { saveBet } from './githubStorage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bettorName, inzet, bets, totalOdds } = req.body;

    if (!bettorName || !bets || bets.length === 0) {
      return res.status(400).json({ error: 'Ongeldige data' });
    }

    // --- Discord Webhook ---
    const webhookURL = process.env.DISCORD_WEBHOOK;
    if (!webhookURL) {
      return res.status(500).json({ error: 'Discord webhook niet ingesteld' });
    }

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

    if (!discordRes.ok) {
      throw new Error('Discord webhook error');
    }

    // --- Opslaan in GitHub via githubStorage.js ---
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GITHUB_TOKEN niet ingesteld' });
    }

    await saveBet({ bettorName, inzet, bets, totalOdds, status: 'open' });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
