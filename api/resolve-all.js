// api/resolve-all.js
import { getFile, updateFile } from "./githubStorage.js";

const token = process.env.GH_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const filePath = process.env.DATA_PATH || "api/bets.json";
const oddsKey = process.env.ODDS_API_KEY;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

export default async function handler(req, res) {
  try {
    // 1. Haal bets op uit GitHub
    const bets = await getFile(owner, repo, filePath, token);

    // 2. Loop over bets en check scores via The Odds API
    const updated = [];
    for (const bet of bets) {
      if (bet.status === "open") {
        const result = await fetch(
          `https://api.the-odds-api.com/v4/sports/${bet.league}/scores/?daysFrom=3&apiKey=${oddsKey}`
        ).then(r => r.json());

        const match = result.find(m => m.id === bet.matchId);

        if (match && match.completed) {
          // check wie gewonnen heeft
          const homeScore = match.scores.find(s => s.name === match.home_team)?.score;
          const awayScore = match.scores.find(s => s.name === match.away_team)?.score;

          let won = false;
          if (bet.pick === match.home_team && homeScore > awayScore) won = true;
          if (bet.pick === match.away_team && awayScore > homeScore) won = true;

          bet.status = won ? "win" : "loss";
          bet.resolvedAt = new Date().toISOString();

          // Update het Discord bericht
          if (bet.messageId) {
            await fetch(`${webhookUrl}/messages/${bet.messageId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                embeds: [
                  {
                    title: `Bet Resultaat`,
                    description: `${bet.user} bet op **${bet.pick}** @ ${bet.odds}\n\nResultaat: ${
                      won ? "✅ Gewonnen" : "❌ Verloren"
                    }`,
                    color: won ? 0x00ff00 : 0xff0000,
                  },
                ],
              }),
            });
          }
        }
      }
      updated.push(bet);
    }

    // 3. Opslaan in GitHub
    await updateFile(owner, repo, filePath, token, updated);

    res.status(200).json({ ok: true, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

