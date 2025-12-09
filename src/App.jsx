import { useState, useEffect } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTone, setSelectedTone] = useState('passive')
  const [cooldown, setCooldown] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  // Timer countdown effect
  useEffect(() => {
    let interval = null
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((c) => c - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [cooldown])

  const tones = {
    passive: {
      emoji: '🙄',
      label: 'Passive Aggressive',
      prompt: 'Rewrite the following text to be professional, corporate, and passive-aggressive. Include a professional Subject Line at the top. Keep the underlying meaning but make it sound like a polite office email that says "I hate you" professionally.'
    },
    cold: {
      emoji: '❄️',
      label: 'Ice Cold',
      prompt: 'Rewrite the following text to be extremely cold, distant, and brief. Include a short, cold Subject Line. Remove all emotion, fluff, and pleasantries. Just hard, cold professional facts.'
    },
    gaslight: {
      emoji: '🔥',
      label: 'Gaslight',
      prompt: 'Rewrite the following text to be manipulative and gaslighting. Include a confusingly helpful Subject Line. Make it sound like the sender is helpful and confused by the recipient\'s incompetence.'
    },
    condescending: {
      emoji: '🧐',
      label: 'Condescending',
      prompt: 'Rewrite the following text to be extremely condescending. Include a patronizing Subject Line. Explain simple concepts as if the recipient is a child, but use sophisticated corporate vocabulary.'
    }
  }

  const handleClapback = async () => {
    if (!input) return
    setLoading(true)
    setOutput('')
    setErrorMsg('')

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim()
    
    if (!API_KEY) {
        setErrorMsg("Error: API Key missing. Go fix Vercel settings.")
        setLoading(false)
        return
    }

    try {
      // WE ARE USING THE ONLY MODEL THAT WORKED FOR YOU
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
                text: `${tones[selectedTone].prompt}: "${input}"`
              }]
            }]
          })
        }
      )

      const data = await response.json()
      
      // If we hit the rate limit, trigger the cooldown UI
      if (data.error) {
         if (data.error.message.includes('Quota') || data.error.code === 429) {
             setCooldown(60) // Start 60s timer
             throw new Error("You hit the speed limit! Cooling down...")
         }
         throw new Error(data.error.message)
      }

      if (data.candidates && data.candidates.length > 0) {
          const reply = data.candidates[0].content.parts[0].text
          setOutput(reply)
      } else {
          setErrorMsg("Google didn't return any text. Try again.")
      }
      
    } catch (error) {
      console.error(error)
      if (!error.message.includes("speed limit")) {
          setErrorMsg(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-1">Corporate Clapback 😤</h1>
        <p className="text-xs text-slate-500 tracking-widest uppercase">Executive Edition</p>
      </header>

      <main className="w-full max-w-3xl space-y-6">
        
        {/* Tone Selector */}
        <div className="grid grid-cols-4 gap-2">
          {Object.keys(tones).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedTone(key)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold transition-all ${
                selectedTone === key 
                  ? 'bg-red-600 text-white shadow-lg scale-105' 
                  : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
              }`}
            >
              <span className="text-xl mb-1">{tones[key].emoji}</span>
              <span className="hidden md:block">{tones[key].label}</span>
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea 
            className="w-full h-24 p-4 bg-slate-900 border border-slate-800 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none text-slate-300 placeholder-slate-600 resize-none"
            placeholder="Type your angry rant here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          <button 
            onClick={handleClapback}
            disabled={loading || cooldown > 0}
            className={`absolute bottom-3 right-3 py-1 px-4 text-sm font-bold rounded-full transition-all ${
                loading || cooldown > 0 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-slate-200'
            }`}
          >
            {loading ? '...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Generate'}
          </button>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {errorMsg && !cooldown && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">
                {errorMsg}
            </div>
        )}

        {/* COOLDOWN MESSAGE DISPLAY */}
        {cooldown > 0 && (
            <div className="p-3 bg-yellow-900/50 border border-yellow-500 rounded text-yellow-200 text-sm text-center animate-pulse">
                ✋ <b>Whoa there!</b> Google needs a break. Please wait <b>{cooldown}</b> seconds.
            </div>
        )}

        {/* EMAIL PREVIEW WINDOW */}
        {output && !cooldown && (
          <div className="mt-8 animate-fadeIn">
            <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden text-slate-800">
              <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 text-xs text-slate-400 font-semibold">New Message</span>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="border-b border-slate-100 pb-2 text-sm text-slate-500">
                  <span className="font-semibold text-slate-400 mr-2">To:</span> 
                  <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">All Staff ✕</span>
                </div>
                
                <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-serif">
                  {output}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                   <button 
                    className="bg-blue-600 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-blue-700"
                    onClick={() => navigator.clipboard.writeText(output)}
                   >
                     Send
                   </button>
                   <span className="text-xs text-slate-400 italic">Sent from Outlook for iPhone</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
