// pages/api/visualize.js

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

  try {
    const { concept, problem, personaDetails, model = 'dall-e-3' } = req.body

    // Create a focused prompt that shows the persona actively using the solution
    const prompt = `
Create a clear, professional illustration showing this exact scenario:

This solution in action: ${concept.description}

The image should clearly show how this solution is solving their problem: ${problem}

Visual requirements:
- Include visual elements that demonstrate the solution in action
- Add relevant environmental details that make the scenario believable
- Use a clean, modern illustration style with good color contrast
- Make it immediately obvious how the solution works

Do not include any text, titles, or labels in the image.
Focus on visual storytelling that explains through action and context.
    `.trim()

    console.log('Generated prompt:', prompt)

    // Generate the image
    const response = await openai.images.generate({
      model,
      prompt,
      size: '1024x1024',
      n: 1,
      quality: 'standard', // or 'hd' for better quality
      style: 'natural' // keeps it realistic and relatable
    })

    const imageUrl = response.data[0].url
    return res.status(200).json({ imageUrl })
  } catch (err) {
    console.error('Visualize API error:', err)
    return res
      .status(500)
      .json({ error: 'Visualization failed', detail: err.message })
  }
}