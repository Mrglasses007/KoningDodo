export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Alleen POST toegestaan" });
    
    const { bettorName, inzet, bets, totalOdds } = req.body;

    if (!bettorName || !inzet || !bets || bets.length === 0) {
      return res.status(400).json({ error: "Ongeldige data" });
    }

    const webhookURL = process.env.DISCORD_WEBHOOK_URL;

    const description = `**Wedder:** ${bettorName}\n**Inzet:** €${inzet}\n**Totaal Odds:** ${totalOdds.toFixed(2)}\n**Wedstrijden:**\n${bets.map(b => `- ${b.match.home_team} - ${b.match.away_team} (${b.outcome.name} ${b.odds.toFixed(2)})`).join("\n")}`;

    const payload = {
      username: "Koning Dodo",
      embeds: [{ title: "Nieuwe weddenschap", description, color: 5763719, timestamp: new Date().toISOString() }]
    };

    const discordRes = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!discordRes.ok) throw new Error("Fout bij Discord");

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
