import { useState } from 'react'

function App() {
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDebug = async () => {
    setLoading(true)
    setOutput('Interrogating Google...')

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim()
    
    if (!API_KEY) {
        setOutput("Error: API Key is missing in Vercel. Fix it.")
        setLoading(false)
        return
    }

    try {
      // We sending a GET request to list all available models
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
      )

      const data = await response.json()
      
      if (data.error) {
         throw new Error(data.error.message)
      }

      // Format the list of models so we can read them
      if (data.models) {
          const modelNames = data.models
              .filter(m => m.supportedGenerationMethods.includes("generateContent")) // Only get ones that can write text
              .map(m => m.name)
              .join('\n')
          
          setOutput("AVAILABLE MODELS (Pick one of these):\n\n" + modelNames)
      } else {
          setOutput("No models found. Your key might be broken.")
      }
      
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
        <h1 className="text-4xl font-bold text-yellow-500 mb-2">DEBUG MODE 🕵️‍♂️</h1>
        <p className="text-slate-400">Let's find out what's wrong.</p>
      </header>

      <main className="w-full max-w-2xl space-y-6">
        <button 
          onClick={handleDebug}
          disabled={loading}
          className="w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-700 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Snitching...' : 'List Available Models'}
        </button>

        <div className="w-full p-4 bg-slate-800 border border-yellow-500/50 rounded-lg text-yellow-300 whitespace-pre-wrap font-mono text-sm">
          {output || "Click the button to see what models your key can use."}
        </div>
      </main>
    </div>
  )
}

export default App
