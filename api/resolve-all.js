import { readBets, writeBets } from "./githubStorage.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Alleen POST toegestaan" });
    return;
  }

  try {
    const bets = await readBets();

    // Markeer alle open bets als “resolved”
    const updatedBets = bets.map((b) => {
      if (!b.status) b.status = "resolved"; // of "win"/"loss" als je dat wilt
      return b;
    });

    await writeBets(updatedBets);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kon bets niet resolven" });
  }
}
