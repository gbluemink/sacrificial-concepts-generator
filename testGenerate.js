// testGenerate.js
// Node.js script to automatically test both /api/enrich and /api/generate
// Usage: node testGenerate.js

const fetch = require('node-fetch'); // ensure node-fetch is installed

(async () => {
  const rawSpec = {
    personaDetails:     "Mid-level marketing manager, 35, values efficiency",
    problemDescription: "Manually compiling weekly reports from 5 different tools",
    frustrations:       "Spends 4+ hours every Friday gathering data",
    jtbds:              "When reports are due, I want to get them done fast so I can focus on strategy",
    workaround:         "Copy/paste from spreadsheets, which often breaks formatting",
    metricsToSwitch:    "Reduce report prep time to under 30 minutes",
    industry:           "Software as a Service",
    rejectedSolutions:  "Tried Zapier; too costly",
    constraints:        "Budget under $1K/month, no new IT infrastructure",
    businessGoals:      "Increase team productivity by 20%",
    businessAssets:     "Has existing BI dashboard and API access to data sources",
  };

  try {
    // Enrichment step
    const enrichRes = await fetch('http://localhost:3000/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rawSpec)
    });
    const { enrichedSpec } = await enrichRes.json();
    console.log('Enriched Spec:');
    console.dir(enrichedSpec, { depth: null });

    // Generation step
    const generateRes = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...enrichedSpec, model: 'o3' })
    });
    const { ideas } = await generateRes.json();
    console.log('\nGenerated Ideas:');
    console.dir(ideas, { depth: null });

  } catch (err) {
    console.error('Error during test:', err);
  }
})();