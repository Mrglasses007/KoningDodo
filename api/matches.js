export default async function handler(req, res) {
  try {
    const { leagueKey } = req.query;
    if (!leagueKey) return res.status(400).json({ ok: false, error: "Geen leagueKey opgegeven" });

    const apiKey = process.env.ODDS_API_KEY;
    const url = `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Fout bij ophalen Odds API");

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
