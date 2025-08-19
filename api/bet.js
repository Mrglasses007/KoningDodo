export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Alleen POST toegestaan" });
    return;
  }

  try {
    const { bettorName, inzet, bets, totalOdds } = req.body;

    if (!bettorName || !inzet || !bets || bets.length === 0) {
      res.status(400).json({ error: "Ongeldige data" });
      return;
    }

    const webhookURL = process.env.DISCORD_WEBHOOK; // Zorg dat deze in Vercel staat

    // Bouw bericht voor Discord
    let description = `**Wedder:** ${bettorName}\n**Inzet:** €${inzet.toLocaleString()}\n**Totaal Odds:** ${totalOdds.toFixed(
      2
    )}\n\n**Weddenschappen:**\n`;

    bets.forEach((bet) => {
      description += `- ${bet.match.home_team} - ${bet.match.away_team}: ${bet.outcome.name} (${bet.odds.toFixed(
        2
      )})\n`;
    });

    const payload = {
      username: "Koning Dodo",
      embeds: [{ title: "Nieuwe weddenschap", description, color: 5763719, timestamp: new Date().toISOString() }],
    };

    const discordRes = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordRes.ok) {
      throw new Error("Fout bij versturen naar Discord");
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon bet niet versturen" });
  }
}
