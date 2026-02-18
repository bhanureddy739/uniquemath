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

  const games = [
    { id: 'add', name: 'Addition', icon: Plus, color: 'bg-math-green', description: 'Adding numbers together' },
    { id: 'sub', name: 'Subtraction', icon: Minus, color: 'bg-math-blue', description: 'Taking numbers away' },
    { id: 'mul', name: 'Multiplication', icon: X, color: 'bg-math-yellow', description: 'Multiplying numbers' },
    { id: 'div', name: 'Division', icon: Divide, color: 'bg-math-purple', description: 'Dividing into groups' },
    { id: 'power', name: 'Power of N', icon: Zap, color: 'bg-math-orange', description: 'Numbers raised to powers' },
    { id: 'factorial', name: 'Factorial', icon: Calculator, color: 'bg-red-100', description: 'Factorial of a number' },
    { id: 'prime', name: 'Prime & Composite', icon: Hash, color: 'bg-indigo-100', description: 'Special number types' },
    { id: 'geometry', name: 'Shapes & Space', icon: Shapes, color: 'bg-math-orange', description: 'Measure areas and volumes' },
    { id: 'mixed', name: 'Mixed Challenge', icon: PlayCircle, color: 'bg-math-purple', description: 'Test all concepts together!' }
  ]

  return (
    <div className="min-h-screen bg-math-blue py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl sm:text-6xl font-extrabold text-soft-text mb-4 drop-shadow-sm"
            onClick={() => setActiveGame(null)}
            style={{ cursor: 'pointer' }}
          >
            UniqueMath 🌈
          </motion.h1>
          <p className="text-lg sm:text-2xl text-soft-text opacity-80 px-4">
            Learn math in a fun and calm way!
          </p>
        </header>

        <AnimatePresence mode="wait">
          {activeGame === null ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {games.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`card cursor-pointer border-b-8 border-math-purple-dark ${game.color} flex flex-col items-center text-center`}
                  onClick={() => setActiveGame(game.id)}
                >
                  <div className="p-4 rounded-2xl bg-white mb-4 shadow-sm">
                    <game.icon size={48} className="text-math-purple-dark" />
                  </div>
                  <h2 className="text-2xl font-black mb-2 text-soft-text">{game.name}</h2>
                  <p className="text-sm font-bold text-soft-text/90 px-2">{game.description}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : activeGame === 'geometry' ? (
            <GeometryGame key="geometry" onBack={() => setActiveGame(null)} />
          ) : activeGame === 'mixed' ? (
            <MixedGame key="mixed" onBack={() => setActiveGame(null)} />
          ) : (
            <MathGame
              key={activeGame}
              type={activeGame}
              onBack={() => setActiveGame(null)}
            />
          )}
        </AnimatePresence>

        <footer className="mt-20 text-center opacity-50 text-sm">
          Built with care for amazing kids ✨
        </footer>
      </div>
    </div>
  )
}

export default App
