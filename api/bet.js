export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Alleen POST toegestaan" });

  const { bettorName, inzet, bets, totalOdds } = req.body;
  if (!bettorName || !inzet || !bets || bets.length === 0)
    return res.status(400).json({ ok: false, error: "Ongeldige data" });

  try {
    // Hier kun je de Discord webhook logica plaatsen
    const webhookURL = process.env.DISCORD_WEBHOOK;
    const description = bets.map(b => `${b.match.home_team} - ${b.match.away_team}: ${b.outcome.name} (${b.odds.toFixed(2)})`).join("\n");

    const payload = {
      username: "Koning Dodo",
      embeds: [{ title: "Nieuwe weddenschap", description, color: 5763719, timestamp: new Date().toISOString() }]
    };

    await fetch(webhookURL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
