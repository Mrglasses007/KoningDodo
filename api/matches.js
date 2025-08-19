// api/matches.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { leagueKey } = req.query;

  if (!leagueKey) {
    return res.status(400).json({ ok: false, error: "leagueKey is required" });
  }

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: "API key not set in environment variables" });
  }

  const url = `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ ok: false, error: "Error fetching from Odds API" });
    }

    const data = await response.json();
    res.status(200).json({ ok: true, matches: data });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
