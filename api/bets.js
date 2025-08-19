import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const { bettorName, inzet, bets, totalOdds } = req.body;
  const webhookURL = process.env.DISCORD_WEBHOOK_URL;

  if (!bettorName || !inzet || !bets || !totalOdds) {
    res.status(400).json({ ok: false, error: "Incomplete payload" });
    return;
  }

  let description = `**Wedder:** ${bettorName}\n**Inzet:** €${inzet.toLocaleString()}\n**Totaal Odds:** ${totalOdds.toFixed(2)}\n\n**Weddenschappen:**\n`;
  bets.forEach(bet => {
    description += `- ${bet.match.home_team} - ${bet.match.away_team}: ${bet.outcome.name} (${bet.odds.toFixed(2)})\n`;
  });

  const payload = {
    username: "Koning Dodo",
    embeds: [{ title: "Nieuwe weddenschap", description, color: 5763719, footer: { text: "Koning Dodo" }, timestamp: new Date().toISOString() }]
  };

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      res.status(200).json({ ok: true });
    } else {
      res.status(500).json({ ok: false, error: "Failed to send to Discord" });
    }
  } catch (error) {
    console.error("Error sending bet:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
