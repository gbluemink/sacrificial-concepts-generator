// pages/api/enrich.js
export default async function handler(req, res) {
  const userSpec = req.body;

  // Build a structured prompt requesting raw and enriched subfields
  const enrichmentPrompt = `
Infer the underlying meaning of each user-provided field and enrich it with specific industry context, terminology, benchmarks, or examples. For each key in the input JSON, respond with an object containing:
  "raw": the original value
  "enriched": a concise expansion reflecting the intended insights and domain details of the original value. If raw field is exactly 'none', N/A' or empty, the enriched value shall be the same as the raw 

Provide ONLY valid JSON with no additional commentary.

Input Data:
${JSON.stringify(userSpec, null, 2)}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'o3',
        messages: [{ role: 'user', content: enrichmentPrompt }],
        temperature: 1
      })
    });
    const data = await response.json();
    console.log('Enrich Handler - Raw OpenAI Response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Enrich missing choices or content', data);
      return res.status(500).json({ error: 'Invalid enrichment response', detail: data });
    }

    // Trim and strip markdown fences if present
    let text = data.choices[0].message.content.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/, '').replace(/```$/, '');
    }

    let enrichedSpec;
    try {
      enrichedSpec = JSON.parse(text);
    } catch (err) {
      console.error('Enrich JSON parse error:', err, text);
      enrichedSpec = userSpec;
    }

    return res.status(200).json({ enrichedSpec });
  } catch (err) {
    console.error('Enrich API error:', err);
    return res.status(500).json({ error: 'Enrichment failed', detail: err.message });
  }
}