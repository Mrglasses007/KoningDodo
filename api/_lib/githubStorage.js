// Helper om JSON-bestand in je GitHub repo te lezen/schrijven via de GitHub Content API


const owner = process.env.GITHUB_OWNER; // bijv. "jouw-github-naam"
const repo = process.env.GITHUB_REPO; // bijv. "koning-dodo"
const filePath = process.env.DATA_PATH || "data/bets.json"; // je kunt zelf pad kiezen
const token = process.env.GH_TOKEN; // fine-grained token met repo content write


const apiBase = "https://api.github.com";


async function fetchJson(url, opts = {}) {
const res = await fetch(url, {
...opts,
headers: {
Accept: "application/vnd.github+json",
Authorization: `Bearer ${token}`,
...(opts.headers || {})
}
});
return res;
}


export async function readBetsFile() {
const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;
const res = await fetchJson(url);


if (res.status === 404) {
// bestand bestaat nog niet
return { bets: [], sha: null };
}


if (!res.ok) {
throw new Error(`GitHub read failed: ${res.status} ${await res.text()}`);
}


const data = await res.json();
const content = Buffer.from(data.content, data.encoding).toString("utf8");


let parsed;
try { parsed = JSON.parse(content); } catch {
parsed = { bets: [] };
}


return { bets: parsed.bets || [], sha: data.sha };
}


export async function writeBetsFile(bets, sha, message = "update bets.json") {
const url = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;
const content = Buffer.from(JSON.stringify({ bets }, null, 2), "utf8").toString("base64");


const body = { message, content };
if (sha) body.sha = sha; // verplicht bij update; weglaten bij eerste create


const res = await fetchJson(url, {
method: "PUT",
body: JSON.stringify(body)
});


if (!res.ok) {
throw new Error(`GitHub write failed: ${res.status} ${await res.text()}`);
}


const json = await res.json();
return json.content.sha; // nieuwe sha
}
