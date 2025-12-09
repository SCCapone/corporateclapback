import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClapback = () => {
    if (!input) return
    setLoading(true)
    setTimeout(() => {
      setOutput("Per my last email, please ensure you actually read the documentation before asking questions that have already been answered. Regards.")
      setLoading(false)
    }, 1500)
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
          {loading ? 'Translating Rage...' : '✨ Professionalize This Shit ✨'}
        </button>

        {output && (
          <div className="space-y-2 animate-pulse">
            <label className="block text-sm font-medium text-green-400">
              Corporate Safe Translation:
            </label>
            <div className="w-full p-4 bg-slate-800 border border-green-500/50 rounded-lg text-green-300">
              {output}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
