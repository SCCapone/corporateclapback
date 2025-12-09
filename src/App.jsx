import React, { useState } from 'react';
import { Briefcase, DollarSign, Copy, Send, Lock, X } from 'lucide-react';

const App = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [tone, setTone] = useState('passive-aggressive');

  // This is where the "AI" logic simulates being smart
  const generateClapback = () => {
    if (!inputText) {
      alert("Type something first, stupid!");
      return;
    }

    setLoading(true);
    setOutputText('');

    // Simulating API latency because real life has lag
    setTimeout(() => {
      let response = "";
      
      const phrases = {
        "fuck you": "I believe there has been a misalignment in our expectations.",
        "this is bullshit": "I am struggling to see the value proposition in this current trajectory.",
        "i don't care": "I will take this under advisement, though it is not a priority at this juncture.",
        "stop emailing me": "Please reduce the frequency of communications so I can focus on deliverables.",
        "you are stupid": "I encourage you to revisit the documentation to gain a clearer understanding.",
        "pay me more": "I would like to discuss a compensation adjustment reflective of my market value.",
        "i quit": "I have decided to pursue other opportunities that align better with my long-term goals."
      };

      // Simple keyword matching for the demo (Real AI would use an API)
      let found = false;
      Object.keys(phrases).forEach(key => {
        if (inputText.toLowerCase().includes(key)) {
          response = phrases[key];
          found = true;
        }
      });

      if (!found) {
        response = "Per my last email, I believe we need to circle back on this offline to ensure we are all singing from the same hymn sheet regarding the granular details of this request.";
      }

      // Add tone flavor
      if (tone === 'passive-aggressive') {
        response += " Thanks in advance for your understanding.";
      } else if (tone === 'cold') {
        response = "Regards. " + response;
      } else if (tone === 'gaslight') {
         response = "I'm confused as to why this is an issue. " + response;
      }

      setOutputText(response);
      setLoading(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    alert("Copied! Now go fake it 'til you make it.");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-300 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Briefcase className="text-blue-600" />
          <h1 className="text-xl font-bold tracking-tight text-blue-900">CorpTranslate AI</h1>
        </div>
        <button 
          onClick={() => setShowPaywall(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <DollarSign size={16} />
          Upgrade to Pro
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900">Turn "F*** You" into "Kind Regards"</h2>
              <p className="text-gray-500">Stop getting fired. Start sounding professional.</p>
            </div>

            {/* Input Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Your Inner Thoughts (Keep it 100)</label>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., I hate this meeting, it's a waste of time, and you are dumb."
                className="w-full h-32 p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all placeholder-gray-400"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setTone('passive-aggressive')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tone === 'passive-aggressive' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Passive Aggressive
                </button>
                <button 
                  onClick={() => setTone('cold')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tone === 'cold' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Ice Cold
                </button>
                 <button 
                  onClick={() => setTone('gaslight')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${tone === 'gaslight' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Gaslight Boss
                </button>
              </div>

              <button 
                onClick={generateClapback}
                disabled={loading}
                className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
              >
                {loading ? 'Translating...' : <>Translate <Send size={16} /></>}
              </button>
            </div>

            {/* Output Section */}
            <div className="relative group">
               <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${!outputText && 'hidden'}`}></div>
               <div className="relative w-full bg-slate-900 rounded-lg p-6 min-h-[120px] flex flex-col justify-center">
                 {!outputText ? (
                   <div className="text-center text-slate-500 text-sm">
                     Corporate translation will appear here...
                   </div>
                 ) : (
                   <>
                    <p className="text-slate-200 font-mono text-lg leading-relaxed">{outputText}</p>
                    <button 
                      onClick={handleCopy}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy size={20} />
                    </button>
                   </>
                 )}
               </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
             <span>Used by 10,000+ angry employees</span>
             <span>v2.0.1 (Savage Edition)</span>
          </div>
        </div>
      </main>

      {/* Fake Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-bounce-in">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            
            <div className="bg-blue-600 p-6 text-center text-white">
              <DollarSign size={48} className="mx-auto mb-2 opacity-80" />
              <h3 className="text-2xl font-bold">Get That Promotion</h3>
              <p className="text-blue-100 text-sm mt-1">Unlock the "CEO Mindset" Language Model</p>
            </div>
            
            <div className="p-8 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                   <div className="bg-green-100 p-2 rounded-full text-green-600"><Lock size={16}/></div>
                   <div>
                     <p className="font-bold text-gray-800">Unlimited Translations</p>
                     <p className="text-xs text-gray-500">Yell at your boss all day long</p>
                   </div>
                </div>
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                   <div className="bg-green-100 p-2 rounded-full text-green-600"><Lock size={16}/></div>
                   <div>
                     <p className="font-bold text-gray-800">Email Templates</p>
                     <p className="text-xs text-gray-500">Resignation, Raise Request, Sick Leave</p>
                   </div>
                </div>
              </div>

              <button className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl mt-4">
                Subscribe - $4.99/mo
              </button>
              <p className="text-center text-xs text-gray-400">Cancel anytime. We know you won't though.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
