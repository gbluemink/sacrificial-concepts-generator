// pages/api/generate.js

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Always use o3 for text generation
  const enrichedSpec = req.body

  try {
    // 1) Instruct the model to return only a JSON array
    const completion = await openai.chat.completions.create({
      model: 'o3',
      messages: [
        {
          role: 'system',
          content: [
            'You are a product discovery assistant.',
            'Given the specification, produce exactly a JSON array of 25 objects, each object having `title`, `description`, and `rationale` fields.',
            'Do NOT include any markdown fences, numbering, explanatory text, or any other content—only output the raw JSON array.'
          ].join(' ')
        },
        {
          role: 'user',
          content: `Here is the enriched specification:\n${JSON.stringify(
            enrichedSpec,
            null,
            2
          )}\n\nPlease output only the JSON array of concepts.`
        }
      ],
      temperature: 1
    })

    // 2) Get the raw text
    let text = completion.choices[0].message.content.trim()

    // 3) Log it for debugging
    console.error('Raw generate response:', text)

    // 4) Attempt to parse it as JSON
    let ideas
    try {
      ideas = JSON.parse(text)
    } catch (parseErr) {
      // If that fails, include the raw text in the error for inspection
      throw new Error(
        `JSON.parse failed: ${parseErr.message}\nRaw response:\n${text}`
      )
    }

    // 5) Return the parsed array
    return res.status(200).json({ ideas })
  } catch (err) {
    console.error('Generate API error:', err)
    // Return the error detail (including raw text if parse failed)
    return res.status(500).json({
      error: 'Generation failed',
      detail: err.message
    })
  }
}
