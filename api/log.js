export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { people_count, timestamp } = req.body || {};
  const count = Number(people_count);

  if (!Number.isFinite(count)) {
    return res.status(400).json({ error: "people_count must be a number" });
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME;
  const token = process.env.AIRTABLE_TOKEN;

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: {
        timestamp: timestamp || new Date().toISOString(),
        people_count: count
      }
    })
  });

  const text = await response.text();
  return res.status(response.ok ? 200 : response.status).send(text);
}
