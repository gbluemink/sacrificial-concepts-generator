// pages/index.js
import { useState } from 'react'
import Head from 'next/head'

// Reusable textarea component
function FormTextArea({ name, label, help, value, onChange }) {
  return (
    <div className="mb-6">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <p className="text-xs text-gray-400 mb-2">{help}</p>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={2}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  )
}

export default function Home() {
  const defaultForm = {
    personaDetails:
      'The persona is a mid-20s to early-40s urban professional who is time-starved, juggling a demanding career and social life, and who fears wasting emotional energy on low-value casual interactions while seeking a meaningful partnership.',
    problemDescription:
      'Users feel like they’re working a second job responding to questions from other suitors on dating apps. Everyone is chasing everyone and there is a lot of ghosting. A lot of time is spent with messages figuring out if there is a match on values and interest, only for the other person to find someone else. This leads to burnout, wasted time.',
    frustrations:
      'The main frustrations are the relentless volume of questions that demand detailed responses, repetitive boilerplate prompts that feel insincere, anxiety about ghosting if replies aren’t instant, difficulty distinguishing casual flings from serious relationships, and spending so much time glued to the phone swiping right/left.',
    jtbds:
      'When they open the dating app, they want to find high-quality matches quickly with matching values and interests so they can go out on real dates that potentially lead to something more meaningful.',
    workaround: 'There is no current workaround',
    otherSolutions: 'There are no other solutions',
    metricsToSwitch:
      'To switch, the solution must reduce daily messaging time from about 1 hour to under five minutes; increase dates per week with quality, value-aligned matches that share relationship goals.',
    industry: 'This problem occurs in the online dating and relationship-matching industry.',
    constraints: 'Must work for both web and mobile apps',
    businessGoals:
      'Business goals include making an app that generates revenue for its builders by delighting users.',
    businessAssets: 'None'
  }

  const [form, setForm] = useState(defaultForm)
  const [enrichedSpec, setEnrichedSpec] = useState(null)
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)

  const [selected, setSelected] = useState(new Set())
  const [showDetails, setShowDetails] = useState({})

  const [selectedImageModel, setSelectedImageModel] = useState('dall-e-3')
  const [imageUrls, setImageUrls] = useState({})
  const [vizLoading, setVizLoading] = useState(false)

  const [modalIndex, setModalIndex] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Enrich
      const enrichRes = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const { enrichedSpec } = await enrichRes.json()
      setEnrichedSpec(enrichedSpec)

      // Generate concepts (always o3)
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...enrichedSpec, model: 'o3' })
      })
      const { ideas } = await genRes.json()
      setIdeas(ideas)
    } catch (err) {
      console.error(err)
      alert('Error generating ideas. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (i) => {
    const next = new Set(selected)
    next.has(i) ? next.delete(i) : next.add(i)
    setSelected(next)
  }

  const toggleDetails = (i) => {
    setShowDetails({ ...showDetails, [i]: !showDetails[i] })
  }

  const handleVisualize = async () => {
    if (selected.size === 0) {
      alert('Please select at least one concept to visualize.')
      return
    }
    setVizLoading(true)
    setImageUrls({})

    try {
      const results = await Promise.all(
        Array.from(selected).map(async (idx) => {
          const concept = ideas[idx]
          const payload = {
            concept: { title: concept.title, description: concept.description },
            problem: form.problemDescription,
            personaDetails: enrichedSpec.personaDetails,
            model: selectedImageModel
          }
          const res = await fetch('/api/visualize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (!res.ok) throw new Error(await res.text())
          const { imageUrl } = await res.json()
          return { idx, imageUrl }
        })
      )
      setImageUrls(Object.fromEntries(results.map((r) => [r.idx, r.imageUrl])))
    } catch (err) {
      console.error('Visualization error:', err)
      alert('Error generating sketches.')
    } finally {
      setVizLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sacrificial Concept Generator</title>
      </Head>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
            🌟 Sacrificial Concept Generator
          </h1>

          {/* Discovery Form */}
          <form onSubmit={handleSubmit}>
            <FormTextArea
              name="personaDetails"
              label="Primary Persona Details"
              help="Age, demographics, education level, relevant fears"
              value={form.personaDetails}
              onChange={handleChange}
            />
            <FormTextArea
              name="problemDescription"
              label="Problem Description"
              help="When/why it happens, frequency, root cause, impact"
              value={form.problemDescription}
              onChange={handleChange}
            />
            <FormTextArea
              name="frustrations"
              label="Main Frustrations"
              help="Specific pain points around the problem"
              value={form.frustrations}
              onChange={handleChange}
            />
            <FormTextArea
              name="jtbds"
              label="Jobs To Be Done (JTBD)"
              help="Desired future state / emotional goal"
              value={form.jtbds}
              onChange={handleChange}
            />
            <FormTextArea
              name="workaround"
              label="Current Workaround"
              help="How they do it today and why it’s suboptimal"
              value={form.workaround}
              onChange={handleChange}
            />
            <FormTextArea
              name="otherSolutions"
              label="Other Solutions Tried"
              help="Any existing solutions the persona considered and why they are suboptimal"
              value={form.otherSolutions}
              onChange={handleChange}
            />
            <FormTextArea
              name="metricsToSwitch"
              label="Switch Metrics"
              help="Key metrics needed to get users to switch"
              value={form.metricsToSwitch}
              onChange={handleChange}
            />
            <FormTextArea
              name="industry"
              label="Industry"
              help="Industry where the problem occurs"
              value={form.industry}
              onChange={handleChange}
            />
            <FormTextArea
              name="constraints"
              label="Constraints"
              help="Technology, budget, regulations, etc."
              value={form.constraints}
              onChange={handleChange}
            />
            <FormTextArea
              name="businessGoals"
              label="Business Goals"
              help="Business objectives the solution should consider"
              value={form.businessGoals}
              onChange={handleChange}
            />
            <FormTextArea
              name="businessAssets"
              label="Business Assets"
              help="People, technology, data the solution could leverage"
              value={form.businessAssets}
              onChange={handleChange}
            />

            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {loading ? 'Generating…' : 'Generate Ideas'}
              </button>
            </div>
          </form>

          {/* Generated Concepts */}
          {ideas.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-6 text-center">
                Generated Concepts
              </h2>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {ideas.map((idea, i) => (
                  <div
                    key={i}
                    className={`bg-white p-6 rounded-lg shadow-lg ${
                      selected.has(i) ? 'ring-4 ring-green-300' : ''
                    }`}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {idea.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {idea.description}
                    </p>
                    {showDetails[i] && (
                      <p className="italic text-gray-500 mb-4">
                        {idea.rationale}
                      </p>
                    )}
                    <div className="flex justify-between">
                      <button
                        onClick={() => toggleDetails(i)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {showDetails[i] ? 'Hide Details' : 'Show Details'}
                      </button>
                      <button
                        onClick={() => toggleSelect(i)}
                        className={`text-sm font-medium ${
                          selected.has(i) ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {selected.has(i) ? 'Deselect' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Image model selector & visualize */}
              <div className="mt-8 flex flex-col items-center space-y-4">
                <label className="font-medium">Image Model:</label>
                <select
                  value={selectedImageModel}
                  onChange={(e) => setSelectedImageModel(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="dall-e-3">DALL·E 3</option>
                  <option value="dall-e-2">DALL·E 2</option>
                </select>
                <button
                  onClick={handleVisualize}
                  disabled={vizLoading || selected.size === 0}
                  className="px-6 py-3 rounded-md text-white bg-green-600 disabled:bg-gray-400"
                >
                  {vizLoading ? 'Generating Sketches…' : 'Generate Sketches'}
                </button>

              </div>

              {/* Sketch thumbnails with titles */}
              <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(imageUrls).map(([idx, url]) => (
                  <div
                    key={idx}
                    className="cursor-pointer"
                    onClick={() => setModalIndex(Number(idx))}
                  >
                    <img
                      src={url}
                      alt={`Sketch ${idx}`}
                      className="w-full rounded-lg shadow"
                    />
                    <p className="mt-2 text-center text-sm font-medium text-gray-800">
                      {ideas[idx].title}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal for full-size sketch */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setModalIndex(null)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalIndex(null)}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
            <img
              src={imageUrls[modalIndex]}
              alt={`Sketch ${modalIndex}`}
              className="w-full"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">
                {ideas[modalIndex].title}
              </h3>
              <p className="mt-2 text-gray-600">
                {ideas[modalIndex].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
