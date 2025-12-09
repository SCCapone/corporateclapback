import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClapback = async () => {
    if (!input) return
    setLoading(true)
    setOutput('')

    // This grabs the key you just hid in Vercel
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
    
    if (!API_KEY) {
        setOutput("Error: You forgot to set the API Key in Vercel, dummy! Go fix your settings.")
        setLoading(false)
        return
    }

    try {
      // We hitting the API raw, no protection
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Rewrite the following text to be professional, corporate, and passive-aggressive. Keep the underlying meaning but make it sound like a polite office email that says "I hate you" professionally: "${input}"`
              }]
            }]
          })
        }
      )

      const data = await response.json()
      
      if (data.error) {
         throw new Error(data.error.message)
      }

      // Extract the corporate speak from the response
      const reply = data.candidates[0].content.parts[0].text
      setOutput(reply)
    } catch (error) {
      console.error(error)
      setOutput("Damn, something broke. " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-2">Corporate Clapback 😤</h1>
        <p className="text-slate-400">Turn your rage into "Professional" emails.</p>
      </header>

      <main className="w-full max-w-2xl space-y-6">
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            What you REALLY wanna say (The Rant):
          </label>
          <textarea 
            className="w-full h-32 p-4 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-200"
            placeholder="e.g. Stop calling me on the weekend you dumb micro-manager..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <button 
          onClick={handleClapback}
          disabled={loading}
          className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Consulting HR...' : '✨ Professionalize This Shit ✨'}
        </button>

        {output && (
          <div className="space-y-2 animate-pulse">
            <label className="block text-sm font-medium text-green-400">
              Corporate Safe Translation:
            </label>
            <div className="w-full p-4 bg-slate-800 border border-green-500/50 rounded-lg text-green-300 whitespace-pre-wrap">
              {output}
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(output)}
              className="text-xs text-slate-500 hover:text-white underline"
            >
              Copy to Clipboard
            </button>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
