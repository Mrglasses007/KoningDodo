// api/matches.js
export default async function handler(req, res) {
  const { leagueKey } = req.query;

  console.log("Request received for leagueKey:", leagueKey);
  console.log("Using API key:", process.env.ODDS_API_KEY ? "✅ set" : "❌ NOT set");

  if (!leagueKey) {
    console.error("leagueKey ontbreekt in request");
    return res.status(400).json({ error: "leagueKey ontbreekt" });
  }

  try {
    const apiKey = process.env.ODDS_API_KEY;

    if (!apiKey) {
      console.error("API key niet gevonden in environment variables");
      return res.status(500).json({ error: "API key ontbreekt" });
    }

    const apiUrl = `https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`;
    console.log("Fetching from URL:", apiUrl);

    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) {
      console.error("Odds API response not OK:", apiRes.status, await apiRes.text());
      return res.status(apiRes.status).json({ error: "Fout bij Odds API", status: apiRes.status });
    }

    const data = await apiRes.json();
    console.log("Fetched matches count:", data.length);
    res.status(200).json(data);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
}
