// api/matches.js

export default async function handler(req, res) {
  const { leagueKey } = req.query;

  if (!leagueKey) {
    return res.status(400).json({ ok: false, error: "leagueKey is required. Bijvoorbeeld: ?leagueKey=soccer_epl" });
  }

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: "API key niet ingesteld in environment variables" });
  }

  const url = `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: `Fout bij ophalen van Odds API: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({
        ok: true,
        matches: [],
        warning: "Geen wedstrijden gevonden voor deze leagueKey. Controleer of deze correct is."
      });
    }

    res.status(200).json({ ok: true, matches: data });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ ok: false, error: "Interne serverfout bij ophalen van wedstrijden" });
  }
}
