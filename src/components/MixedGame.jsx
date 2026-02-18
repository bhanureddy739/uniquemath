import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertCircle, PlayCircle, BookOpen, ArrowRight, Lightbulb, Trophy, RotateCcw, Calculator } from 'lucide-react'
import confetti from 'canvas-confetti'
import MathGame from './MathGame'
import GeometryGame from './GeometryGame'

const MixedGame = ({ onBack }) => {
    const [gameState, setGameState] = useState('learn') // learn, setup, play, results
    const [difficulty, setDifficulty] = useState('easy')
    const [totalQuestions, setTotalQuestions] = useState(5)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [results, setResults] = useState([]) // array of { question, result: 'correct' | 'wrong' }
    const [answerType, setAnswerType] = useState('mix')
    const [currentModule, setCurrentModule] = useState(null)

    const modules = ['add', 'sub', 'mul', 'div', 'power', 'factorial', 'prime', 'geometry']

    const startGame = () => {
        setScore(0)
        setCurrentQuestionIndex(0)
        setResults([])
        setGameState('play')
        pickRandomModule()
    }

    const pickRandomModule = () => {
        const randomModule = modules[Math.floor(Math.random() * modules.length)]
        setCurrentModule(randomModule)
    }

    const handleQuestionFinish = (isCorrect) => {
        const newResults = [...results, { index: currentQuestionIndex, isCorrect }]
        setResults(newResults)
        if (isCorrect) setScore(s => s + 1)

        if (currentQuestionIndex + 1 >= totalQuestions) {
            setGameState('results')
            if (score + (isCorrect ? 1 : 0) === totalQuestions) {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
            }
        } else {
            setCurrentQuestionIndex(i => i + 1)
            pickRandomModule()
        }
    }

    if (gameState === 'results') {
        const percentage = Math.round((score / totalQuestions) * 100)
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto card p-10 text-center border-b-8 border-math-green-dark">
                <Trophy size={80} className="mx-auto text-math-yellow-dark mb-6" />
                <h2 className="text-4xl font-black mb-2 text-soft-text">Challenge Complete!</h2>
                <p className="text-xl text-soft-text/80 mb-8">You finished the {difficulty} level</p>

                <div className="bg-math-blue/30 rounded-3xl p-8 mb-8">
                    <div className="text-6xl font-black text-math-purple-dark mb-2">{score} / {totalQuestions}</div>
                    <p className="text-lg font-bold text-soft-text">{percentage}% Correct</p>
                </div>

                <div className="flex flex-col gap-4">
                    <button onClick={startGame} className="btn-primary bg-math-purple-dark text-white py-4 flex items-center justify-center gap-2">
                        <RotateCcw /> Play Again
                    </button>
                    <button onClick={onBack} className="btn-secondary py-4 text-soft-text font-bold">
                        Back to Dashboard
                    </button>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
        >
            <div className="flex justify-between items-center mb-8 bg-white/50 p-4 rounded-2xl">
                <button
                    onClick={onBack}
                    className="flex items-center text-soft-text hover:text-math-purple-dark font-bold transition-colors"
                >
                    <ArrowLeft className="mr-2" /> Back
                </button>

                <div className="flex bg-white/50 rounded-2xl p-1 gap-1">
                    <button
                        onClick={() => setGameState('learn')}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${gameState === 'learn' ? 'bg-math-purple text-white shadow-md' : 'text-soft-text opacity-50'}`}
                    >
                        <BookOpen size={20} /> Learn
                    </button>
                    <button
                        onClick={() => setGameState('setup')}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${gameState === 'play' || gameState === 'setup' ? 'bg-math-purple text-white shadow-md' : 'text-soft-text opacity-50'}`}
                    >
                        <PlayCircle size={20} /> Play
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {gameState === 'learn' ? (
                    <motion.div
                        key="learn-mixed"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="card py-10 px-8 border-b-8 border-math-purple-dark"
                    >
                        <h2 className="text-4xl font-black mb-8 text-center text-soft-text text-math-purple-dark">Mixed Math Challenge 🌈</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                            <div className="p-6 bg-math-blue/30 rounded-3xl border-2 border-math-blue/50">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-math-purple-dark">
                                    <Calculator className="text-math-purple-dark" />
                                    Ultimate Test
                                </h3>
                                <p className="text-soft-text font-medium leading-relaxed">
                                    This challenge combines everything you've learned! You'll face addition, subtraction, geometry, and prime numbers all in one go.
                                </p>
                            </div>
                            <div className="p-6 bg-math-green/30 rounded-3xl border-2 border-math-green/50">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-math-green-dark">
                                    <Trophy className="text-green-600" />
                                    Show Your Skills
                                </h3>
                                <p className="text-soft-text font-medium leading-relaxed">
                                    Choose your difficulty and number of questions. Try to get a perfect score to earn the Golden Trophy!
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setGameState('setup')}
                            className="btn-primary bg-math-purple-dark text-white w-full py-4 text-xl flex items-center justify-center gap-2"
                        >
                            I'm Ready to Play! <ArrowRight />
                        </button>
                    </motion.div>
                ) : gameState === 'setup' ? (
                    <motion.div
                        key="setup-mixed"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-xl mx-auto card p-8 text-center border-b-8 border-math-purple"
                    >
                        <h2 className="text-3xl font-black mb-8 text-soft-text">Mixed Challenge Setup</h2>

                        <div className="mb-8">
                            <p className="text-lg font-bold mb-4 text-soft-text">Choose Difficulty:</p>
                            <div className="flex gap-4 justify-center">
                                {['easy', 'medium', 'hard'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={`px-6 py-2 rounded-2xl font-bold capitalize transition-all ${difficulty === d ? 'bg-math-purple-dark text-white shadow-md' : 'bg-math-purple text-math-purple-dark'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-lg font-bold mb-4 text-soft-text">Answer Type:</p>
                            <div className="flex gap-4 justify-center">
                                {[
                                    { id: 'fill', label: 'Fill-in' },
                                    { id: 'mcq', label: 'MCQs' },
                                    { id: 'mix', label: 'Mix' }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setAnswerType(t.id)}
                                        className={`px-6 py-2 rounded-2xl font-bold transition-all ${answerType === t.id ? 'bg-math-purple-dark text-white shadow-md' : 'bg-math-purple text-math-purple-dark'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-10">
                            <p className="text-lg font-bold mb-4 text-soft-text">Number of Questions:</p>
                            <div className="flex justify-center">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={totalQuestions}
                                    onChange={(e) => setTotalQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="text-3xl w-32 text-center py-3 rounded-2xl border-4 border-math-purple focus:border-math-purple-dark outline-none bg-math-purple/20 font-black text-math-purple-dark"
                                />
                            </div>
                        </div>

                        <button onClick={startGame} className="btn-primary bg-math-purple-dark text-white w-full py-4 text-xl flex items-center justify-center gap-2">
                            Start Challenge! <PlayCircle />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="playing-mixed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-sm font-black text-math-purple-dark uppercase tracking-widest">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </div>
                            <div className="text-sm font-black text-math-purple-dark uppercase tracking-widest">
                                Score: {score}
                            </div>
                        </div>

                        {currentModule === 'geometry' ? (
                            <GeometryGame
                                onBack={() => setGameState('setup')}
                                initialMode="play"
                                initialAnswerType={answerType}
                                difficulty={difficulty}
                                onFinish={handleQuestionFinish}
                                isMixedMode={true}
                            />
                        ) : (
                            <MathGame
                                type={currentModule}
                                onBack={() => setGameState('setup')}
                                initialMode="play"
                                initialAnswerType={answerType}
                                difficulty={difficulty}
                                onFinish={handleQuestionFinish}
                                isMixedMode={true}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default MixedGame
