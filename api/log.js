export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const {
      people_count,
      raw_people_count,
      active_track_ids,
      unique_confirmed_ids,
      timestamp,
      test
    } = req.body || {};

    const stableCount = Number(people_count);
    const rawCount = raw_people_count == null ? stableCount : Number(raw_people_count);
    const activeTracks = active_track_ids == null ? null : Number(active_track_ids);
    const uniqueConfirmed = unique_confirmed_ids == null ? null : Number(unique_confirmed_ids);

    if (!Number.isFinite(stableCount)) {
      return res.status(400).json({ error: "people_count must be a number" });
    }
    if (!Number.isFinite(rawCount)) {
      return res.status(400).json({ error: "raw_people_count must be a number when provided" });
    }
    if (activeTracks !== null && !Number.isFinite(activeTracks)) {
      return res.status(400).json({ error: "active_track_ids must be a number when provided" });
    }
    if (uniqueConfirmed !== null && !Number.isFinite(uniqueConfirmed)) {
      return res.status(400).json({ error: "unique_confirmed_ids must be a number when provided" });
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const table = process.env.AIRTABLE_TABLE_NAME;
    const token = process.env.AIRTABLE_TOKEN;

    if (!baseId || !table || !token) {
      return res.status(500).json({ error: "Missing Airtable env vars on server" });
    }

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;

    const fields = {
      timestamp: timestamp || new Date().toISOString(),
      people_count: stableCount,
      raw_people_count: rawCount,
    };

    if (activeTracks !== null) fields.active_track_ids = activeTracks;
    if (uniqueConfirmed !== null) fields.unique_confirmed_ids = uniqueConfirmed;
    if (test === true) fields.test = true;

    const airtableResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        records: [
          { fields }
        ]
      })
    });

    const data = await airtableResponse.text();

    if (!airtableResponse.ok) {
      return res.status(airtableResponse.status).json({
        error: "Airtable API error",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      logged_people_count: stableCount,
      logged_raw_people_count: rawCount
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: String(err)
    });
  }
}
