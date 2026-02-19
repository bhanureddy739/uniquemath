import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Minus, X, Divide, Zap, Calculator,
  Shapes, Hash, PlayCircle
} from 'lucide-react'
import MathGame from './components/MathGame'
import GeometryGame from './components/GeometryGame'
import MixedGame from './components/MixedGame'

function App() {
  const [activeGame, setActiveGame] = useState(null)
  const [quietMode, setQuietMode] = useState(false)
  const [globalStars, setGlobalStars] = useState(0)

  const handleReward = (stars = 1) => {
    setGlobalStars(prev => prev + stars)
  }

  const games = [
    { id: 'add', name: 'Addition', icon: Plus, color: 'bg-math-green', description: 'Putting things together' },
    { id: 'sub', name: 'Subtraction', icon: Minus, color: 'bg-math-blue', description: 'Taking things away' },
    { id: 'mul', name: 'Multiplication', icon: X, color: 'bg-math-yellow', description: 'Multiplying numbers' },
    { id: 'div', name: 'Division', icon: Divide, color: 'bg-math-purple', description: 'Sharing equally' },
    { id: 'power', name: 'Powers', icon: Zap, color: 'bg-math-orange', description: 'Multiplying by itself' },
    { id: 'factorial', name: 'Factorial', icon: Calculator, color: 'bg-red-50', description: 'Multiplying down to 1' },
    { id: 'prime', name: 'Numbers', icon: Hash, color: 'bg-indigo-50', description: 'Special number types' },
    { id: 'geometry', name: 'Shapes', icon: Shapes, color: 'bg-math-orange', description: 'Measuring space' },
    { id: 'mixed', name: 'All Concepts', icon: PlayCircle, color: 'bg-math-purple', description: 'Test everything!' }
  ]

  return (
    <div className={`min-h-screen bg-math-blue py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${quietMode ? 'quiet-mode' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col items-center mb-12">
          <div className="flex justify-between items-center w-full mb-8">
            <div
              className="text-3xl sm:text-5xl font-black text-soft-text hover:opacity-80 transition-opacity flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveGame(null)}
            >
              UniqueMath {!quietMode && <span>🌈</span>}
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/50 px-4 py-2 rounded-full flex items-center gap-2 font-black text-math-yellow-dark shadow-sm">
                <span className="text-2xl">⭐</span> {globalStars}
              </div>
              <button
                onClick={() => setQuietMode(!quietMode)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-lg transition-all ${quietMode ? 'bg-math-purple-dark text-white shadow-inner' : 'bg-white text-math-purple-dark shadow-sm hover:shadow-md'}`}
              >
                <Zap size={20} className={quietMode ? 'text-yellow-300' : ''} />
                {quietMode ? 'Quiet Mode ON' : 'Quiet Mode OFF'}
              </button>
            </div>
          </div>

          <p className="text-lg sm:text-2xl text-soft-text/70 font-medium text-center">
            {quietMode ? 'Focus on learning one step at a time.' : 'Learn math in a fun and calm way!'}
            {activeGame && <span className="sr-only">Active: {activeGame}</span>}
          </p>
        </header>

        <AnimatePresence mode="wait">
          {activeGame === null ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {games.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={quietMode ? {} : { scale: 1.02 }}
                  whileTap={quietMode ? {} : { scale: 0.98 }}
                  className={`card cursor-pointer border-b-8 border-math-purple-dark/20 ${game.color} flex flex-col items-center text-center p-8`}
                  onClick={() => setActiveGame(game.id)}
                >
                  <div className="p-4 rounded-3xl bg-white mb-4 shadow-sm">
                    <game.icon size={42} className="text-math-purple-dark" />
                  </div>
                  <h2 className="text-2xl font-black mb-1 text-soft-text">{game.name}</h2>
                  <p className="text-sm font-bold text-soft-text/60">{game.description}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : activeGame === 'geometry' ? (
            <GeometryGame key="geometry" onBack={() => setActiveGame(null)} quietMode={quietMode} onReward={handleReward} />
          ) : activeGame === 'mixed' ? (
            <MixedGame key="mixed" onBack={() => setActiveGame(null)} quietMode={quietMode} onReward={handleReward} />
          ) : (
            <MathGame
              key={activeGame}
              type={activeGame}
              onBack={() => setActiveGame(null)}
              quietMode={quietMode}
              onReward={handleReward}
            />
          )}
        </AnimatePresence>

        <footer className="mt-20 text-center opacity-30 text-sm font-bold tracking-wide">
          BUILT WITH CARE FOR AMAZING KIDS
        </footer>
      </div>
    </div>
  )
}

export default App
