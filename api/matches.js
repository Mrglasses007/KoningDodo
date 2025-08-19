export default async function handler(req, res) {
  const { leagueKey } = req.query;

  if (!leagueKey) {
    res.status(400).json({ error: "leagueKey is verplicht" });
    return;
  }

  const apiKey = process.env.ODDS_API_KEY; // Zorg dat deze in Vercel is ingesteld

  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`
    );

    if (!response.ok) {
      throw new Error(`API fout: ${response.status}`);
    }

    const matches = await response.json();
    res.status(200).json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon wedstrijden niet ophalen" });
  }
}
