import fetch from 'node-fetch';

export default async function handler(req, res) {
  const leagueKey = req.query.leagueKey;
  const apiKey = process.env.ODDS_API_KEY;

  if (!leagueKey) {
    return res.status(400).json({ error: "leagueKey is verplicht" });
  }

  try {
    const response = await fetch(`https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`);
    if (!response.ok) throw new Error("Fout bij API");

    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Kan wedstrijden niet laden" });
  }
}
