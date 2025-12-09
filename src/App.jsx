import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTone, setSelectedTone] = useState('passive')

  // This is where the magic happens. Different prompts for different vibes.
  const tones = {
    passive: {
      emoji: '🙄',
      label: 'Passive Aggressive',
      prompt: 'Rewrite the following text to be professional, corporate, and passive-aggressive. Keep the underlying meaning but make it sound like a polite office email that says "I hate you" professionally.'
    },
    cold: {
      emoji: '❄️',
      label: 'Ice Cold',
      prompt: 'Rewrite the following text to be extremely cold, distant, and brief. Remove all emotion, fluff, and pleasantries. Just hard, cold professional facts that shut down the conversation immediately.'
    },
    gaslight: {
      emoji: '🔥',
      label: 'Gaslight',
      prompt: 'Rewrite the following text to be manipulative and gaslighting. Make it sound like the sender is helpful and confused by the recipient\'s incompetence. Imply the recipient is misremembering things or is the source of the problem.'
    },
    condescending: {
      emoji: '🧐',
      label: 'Condescending',
      prompt: 'Rewrite the following text to be extremely condescending and patronizing. Explain simple concepts as if the recipient is a child, but use sophisticated corporate vocabulary to mask the insult.'
    }
  }

  const handleClapback = async () => {
    if (!input) return
    setLoading(true)
    setOutput('')

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim()
    
    if (!API_KEY) {
        setOutput("Error: API Key missing. Go fix Vercel settings.")
        setLoading(false)
        return
    }

    try {
      // Using the reliable 'gemini-flash-latest' because we know it works
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                // We inject the specific tone prompt here
                text: `${tones[selectedTone].prompt}: "${input}"`
              }]
            }]
          })
        }
      )

      const data = await response.json()
      
      if (data.error) {
         throw new Error(data.error.message)
      }

      if (data.candidates && data.candidates.length > 0) {
          const reply = data.candidates[0].content.parts[0].text
          setOutput(reply)
      } else {
          setOutput("Google didn't return any text. Try again.")
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
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-red-500 mb-2">Corporate Clapback 😤</h1>
        <p className="text-slate-400">Choose your weapon and destroy them professionally.</p>
      </header>

      <main className="w-full max-w-2xl space-y-6">
        
        {/* Input Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            The Rant (What you really wanna say):
          </label>
          <textarea 
            className="w-full h-32 p-4 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-200"
            placeholder="e.g. You are the worst boss ever..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Tone Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Select Your Vibe:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.keys(tones).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedTone(key)}
                className={`p-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                  selectedTone === key 
                    ? 'bg-red-600 text-white ring-2 ring-white' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span className="block text-xl mb-1">{tones[key].emoji}</span>
                {tones[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleClapback}
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-lg text-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Translating Rage...' : '✨ Professionalize This Shit ✨'}
        </button>

        {/* Output Section */}
        {output && (
          <div className="space-y-2 animate-fadeIn">
            <label className="block text-sm font-medium text-green-400">
              Corporate Safe Translation:
            </label>
            <div className="w-full p-6 bg-slate-800 border border-green-500/50 rounded-lg shadow-green-900/20 shadow-xl">
              <div className="text-green-300 whitespace-pre-wrap leading-relaxed">
                {output}
              </div>
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
