import fetch from "node-fetch";

export default async function handler(req, res) {
  const apiKey = process.env.ODDS_API_KEY; // je env key in Vercel

  const leagues = {
    "soccer_netherlands_eredivisie": "Eredivisie",
    "soccer_epl": "Premier League",
    "soccer_uefa_champs_league_qualification": "Champions League Kwalificatie",
    "soccer_uefa_champs_league": "Champions League"
  };

  const { leagueKey } = req.query;
  if (!leagueKey || !leagues[leagueKey]) return res.status(400).json({ error: "Ongeldige leagueKey" });

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fout bij API call");
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
