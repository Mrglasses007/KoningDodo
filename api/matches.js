// api/matches.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  // Gebruik URLSearchParams voor veilige query parsing
  const url = new URL(req.url, `http://${req.headers.host}`);
  const leagueKey = url.searchParams.get("leagueKey");

  if (!leagueKey) {
    return res
      .status(400)
      .json({ ok: false, error: "leagueKey is required. Bijvoorbeeld: ?leagueKey=soccer_epl" });
  }

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ ok: false, error: "API key niet ingesteld in environment variables" });
  }

  const apiUrl = `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ ok: false, error: `Fout bij ophalen van Odds API: ${response.status} ${response.statusText}` });
    }

    const data = await response.json();

    // schrijf de bets naar een lokale bets.json
    const betsPath = path.join(process.cwd(), "bets.json");
    fs.writeFileSync(betsPath, JSON.stringify({ leagueKey, matches: data }, null, 2));

    res.status(200).json({ ok: true, matches: data });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ ok: false, error: "Interne serverfout bij ophalen van wedstrijden" });
  }
}
