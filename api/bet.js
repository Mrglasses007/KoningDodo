// Ontvangt een bet van de frontend, post naar Discord (met ?wait=true) en slaat op in bets.json
`**Inzet:** €${formatCurrency(inzet)}`,
`**Totaal Odds:** ${totOdds.toFixed(2)}`,
`**Potentiële Uitbetaling:** €${formatCurrency(rawPayout)}${rawPayout > MAX_PAYOUT ? ` (Max €${formatCurrency(MAX_PAYOUT)})` : ''}`,
"",
"**Weddenschappen:**",
...selections.map(s => `- ${s.home} - ${s.away} (${new Date(s.commence_time).toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}): ${s.pick}`)
].join("\n");


const payload = {
username: "Koning Dodo",
embeds: [
{
title: `Nieuwe weddenschap • ${id}`,
description: descriptionLines,
color: 5763719,
footer: { text: "Koning Dodo" },
timestamp: createdAt
}
]
};


const webhookUrl = DISCORD_WEBHOOK_URL.includes("?wait=")
? DISCORD_WEBHOOK_URL
: `${DISCORD_WEBHOOK_URL}?wait=true`;


const discordRes = await fetch(webhookUrl, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload)
});


if (!discordRes.ok) {
const txt = await discordRes.text();
return res.status(500).json({ ok: false, error: `Discord webhook error: ${discordRes.status} ${txt}` });
}


const discordMsg = await discordRes.json(); // bevat id van bericht


// opslaan in GitHub
const { bets, sha } = await readBetsFile();
const record = {
id,
createdAt,
bettor,
stake: inzet,
totalOdds: totOdds,
maxPayout: MAX_PAYOUT,
payout,
selections,
status: "open",
discordMessageId: discordMsg?.id || null
};


bets.push(record);
const newSha = await writeBetsFile(bets, sha, `bet:create ${id}`);


res.status(200).json({ ok: true, id, messageId: discordMsg?.id || null, sha: newSha });
} catch (err) {
console.error(err);
res.status(500).json({ ok: false, error: err.message || String(err) });
}
}
