import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTone, setSelectedTone] = useState('passive')
  const [cooldown, setCooldown] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [isListening, setIsListening] = useState(false)
  
  // Reference to the email window so we can take a picture of it
  const emailRef = useRef(null)

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
    passive: { emoji: '🙄', label: 'Passive Aggressive', prompt: 'Rewrite text to be professional, corporate, and passive-aggressive. Include a Subject Line.' },
    cold: { emoji: '❄️', label: 'Ice Cold', prompt: 'Rewrite text to be extremely cold, distant, and brief. Include a short, cold Subject Line.' },
    gaslight: { emoji: '🔥', label: 'Gaslight', prompt: 'Rewrite text to be manipulative and gaslighting. Include a confusingly helpful Subject Line.' },
    condescending: { emoji: '🧐', label: 'Condescending', prompt: 'Rewrite text to be extremely condescending. Include a patronizing Subject Line.' }
  }

  // --- VOICE INPUT LOGIC ---
  const handleMic = () => {
    // Check if browser supports speech
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert("Your phone doesn't support voice input. Use a better browser, broke boy.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => prev + " " + transcript)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error(event.error)
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  // --- SCREENSHOT SHARE LOGIC ---
  const handleShare = async () => {
    if (!emailRef.current) return

    try {
      const canvas = await html2canvas(emailRef.current, { backgroundColor: null })
      const blob = await new Promise(resolve => canvas.toBlob(resolve))
      const file = new File([blob], 'clapback.png', { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Corporate Clapback',
          text: 'Look at this professional violation I just generated.'
        })
      } else {
        alert("Your device is acting shy. Just take a regular screenshot.")
      }
    } catch (err) {
      console.error(err)
      alert("Screenshot failed. You on your own.")
    }
  }

  // --- AI GENERATION LOGIC ---
  const handleClapback = async () => {
    if (!input) return
    setLoading(true)
    setOutput('')
    setErrorMsg('')

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim()
    if (!API_KEY) {
        setErrorMsg("Error: API Key missing.")
        setLoading(false)
        return
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${tones[selectedTone].prompt}: "${input}"` }]
            }]
          })
        }
      )

      const data = await response.json()
      
      if (data.error) {
         if (data.error.message.includes('Quota') || data.error.code === 429) {
             setCooldown(60)
             throw new Error("You hit the speed limit! Cooling down...")
         }
         throw new Error(data.error.message)
      }

      if (data.candidates && data.candidates.length > 0) {
          setOutput(data.candidates[0].content.parts[0].text)
      } else {
          setErrorMsg("Google didn't return any text.")
      }
    } catch (error) {
      if (!error.message.includes("speed limit")) setErrorMsg(error.message)
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
                selectedTone === key ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
              }`}
            >
              <span className="text-xl mb-1">{tones[key].emoji}</span>
              <span className="hidden md:block">{tones[key].label}</span>
            </button>
          ))}
        </div>

        {/* Input Area with MIC BUTTON */}
        <div className="relative">
          <textarea 
            className="w-full h-24 p-4 bg-slate-900 border border-slate-800 rounded-lg focus:ring-1 focus:ring-red-500 focus:outline-none text-slate-300 placeholder-slate-600 resize-none pr-12"
            placeholder={isListening ? "Listening... Speak your rage!" : "Type or speak your angry rant here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          {/* MIC BUTTON */}
          <button 
            onClick={handleMic}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-800 text-slate-400'}`}
            title="Voice Input"
          >
            🎤
          </button>

          {/* GENERATE BUTTON */}
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

        {errorMsg && !cooldown && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">{errorMsg}</div>
        )}

        {cooldown > 0 && (
            <div className="p-3 bg-yellow-900/50 border border-yellow-500 rounded text-yellow-200 text-sm text-center animate-pulse">
                ✋ <b>Chill!</b> Wait <b>{cooldown}</b> seconds.
            </div>
        )}

        {/* EMAIL PREVIEW WINDOW */}
        {output && !cooldown && (
          <div className="mt-8 animate-fadeIn">
            {/* We ref this div to take the screenshot */}
            <div ref={emailRef} className="w-full bg-white rounded-lg shadow-2xl overflow-hidden text-slate-800">
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
                   <div className="flex gap-2">
                     <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold text-sm">Send</button>
                     {/* SHARE BUTTON */}
                     <button 
                       onClick={handleShare}
                       className="bg-slate-200 text-slate-700 px-3 py-2 rounded font-semibold text-sm flex items-center gap-1 hover:bg-slate-300"
                     >
                       📸 Share
                     </button>
                   </div>
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
