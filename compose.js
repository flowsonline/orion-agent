export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

  const { product, industry, goal, tone, platform, needVoice, notes } = req.body || {};
  if (!product || !industry || !goal || !tone || !platform) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `
You are Orion, a social media creative strategist.
Generate concise marketing assets for a single post.

Fields:
- Product/brand: ${product}
- Industry: ${industry}
- Goal: ${goal}
- Tone/style: ${tone}
- Platform/format: ${platform}
- Voiceover needed: ${needVoice ? "yes" : "no"}
- Extra notes: ${notes || "none"}

Return strict JSON with:
{
  "headline": "short headline for overlay",
  "caption": "2-3 sentence social caption; include CTA",
  "hashtags": ["#tag1", "#tag2"],
  "script": "optional 6-12s voiceover script (omit if not needed)"
}
  `.trim();

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: "OpenAI compose error", details: t });
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || "{}";
    let out = {};
    try { out = JSON.parse(text); } catch(e) {
      const m = text.match(/\{[\s\S]*\}/);
      out = m ? JSON.parse(m[0]) : {};
    }
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
