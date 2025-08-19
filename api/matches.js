import fetch from "node-fetch";

export default async function handler(req, res) {
  const { leagueKey } = req.query;
  const apiKey = process.env.ODDS_API_KEY;

  if (!leagueKey) {
    res.status(400).json({ ok: false, error: "leagueKey is required" });
    return;
  }

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    res.status(200).json({ ok: true, matches: data });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
