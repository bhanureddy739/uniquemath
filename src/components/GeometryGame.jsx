import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertCircle, BookOpen, PlayCircle, ArrowRight, Lightbulb, Trophy, RotateCcw, Camera, Volume2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { captureScreen } from './ScreenCapture'

const GeometryGame = ({ onBack, initialMode = 'learn', difficulty: propDifficulty = 'easy', onFinish, isMixedMode = false, initialAnswerType = 'mix', quietMode = false, onReward }) => {
    const [mode, setMode] = useState(initialMode) // setup, learn, play, results
    const [currentStep, setCurrentStep] = useState(0)
    const [difficulty, setDifficulty] = useState(propDifficulty)
    const [question, setQuestion] = useState({ type: 'area', shape: 'square', dim1: 0, dim2: 0, dim3: 0, answer: 0 })
    const [userInput, setUserInput] = useState('')
    const [status, setStatus] = useState('idle') // idle, correct, wrong, showing-result
    const [score, setScore] = useState(0)
    const [totalQuestions, setTotalQuestions] = useState(5)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [results, setResults] = useState([])
    const [feedback, setFeedback] = useState('')
    const [answerType, setAnswerType] = useState(initialAnswerType) // fill, mcq, mix
    const [options, setOptions] = useState([])
    const [activeLearnTopic, setActiveLearnTopic] = useState(null)
    const [currentQuestionType, setCurrentQuestionType] = useState('fill')

    // Learning content
    const learnData = {
        area: {
            title: "Learning Area",
            steps: [
                {
                    text: "Area is the space inside a shape!",
                    visual: () => (
                        <div className="w-32 h-20 bg-math-purple/30 border-4 border-math-purple rounded-lg shadow-sm"></div>
                    )
                },
                {
                    text: "Imagine filling it with small tiles.",
                    visual: () => (
                        <div className="grid grid-cols-4 grid-rows-2 w-48 h-24 border-2 border-math-purple/20">
                            {Array(8).fill(0).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="border border-math-purple/40 bg-math-purple/30"
                                ></motion.div>
                            ))}
                        </div>
                    )
                },
                {
                    text: "Multiply the sides! 4 across × 2 down = 8 tiles.",
                    visual: () => (
                        <div className="flex flex-col items-center">
                            <div className="text-4xl font-black text-math-purple-dark">4 × 2 = 8</div>
                            <p className="mt-2 font-bold opacity-60">Side × Side = Area!</p>
                        </div>
                    )
                }
            ]
        },
        volume: {
            title: "Learning Volume",
            steps: [
                {
                    text: "Volume is the space inside a 3D box! Let's build the base.",
                    visual: () => (
                        <div className="flex gap-1">
                            {Array(4).fill(0).map((_, i) => <div key={i} className="w-8 h-8 bg-pink-300 border-2 border-pink-500 rounded shadow-sm"></div>)}
                        </div>
                    )
                },
                {
                    text: "Now stack layers on top! 3 layers high.",
                    visual: () => (
                        <div className="flex flex-col-reverse items-center">
                            {[1, 2, 3].map((layer) => (
                                <motion.div
                                    key={layer}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: layer * 0.3 }}
                                    className="flex gap-1 mt-[-4px]"
                                >
                                    {Array(4).fill(0).map((_, j) => (
                                        <div key={j} className="w-8 h-8 bg-pink-400 border-2 border-pink-600 rounded shadow-md"></div>
                                    ))}
                                </motion.div>
                            ))}
                        </div>
                    )
                },
                {
                    text: "L × W × H = Total Space!",
                    visual: () => (
                        <div className="text-center">
                            <div className="text-4xl font-black text-pink-600">4 × 1 × 3 = 12</div>
                            <p className="mt-2 font-bold opacity-60 italic">Cubes fill the box!</p>
                        </div>
                    )
                }
            ]
        },
        triangle: {
            title: "Learning Triangles",
            steps: [
                {
                    text: "A triangle is half of a rectangle!",
                    visual: () => (
                        <div className="relative w-32 h-20 border-2 border-dashed border-math-purple">
                            <motion.div
                                initial={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 100%)' }}
                                animate={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0%)' }}
                                transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                                className="absolute inset-0 bg-math-purple/40"
                            ></motion.div>
                        </div>
                    )
                },
                {
                    text: "(Base × Height) divided by 2.",
                    visual: () => (
                        <div className="text-3xl font-black text-math-purple-dark text-center">
                            (4 × 5) / 2 = 10
                        </div>
                    )
                }
            ]
        },
        circle: {
            title: "Learning Circles",
            steps: [
                {
                    text: "A circle's area depends on its Radius (the distance to the middle). ⭕",
                    visual: () => (
                        <div className="w-24 h-24 rounded-full border-4 border-math-purple bg-math-purple/30 flex items-center justify-center relative shadow-lg">
                            <div className="w-12 h-1 bg-math-purple-dark absolute left-1/2 origin-left shadow-sm"></div>
                            <div className="absolute top-1/2 left-[70%] text-sm font-black text-math-purple-dark bg-white/80 px-1 rounded-sm">r</div>
                        </div>
                    )
                },
                {
                    text: "For easy math, we use: Area = 3 × Radius × Radius.",
                    visual: () => (
                        <div className="text-3xl font-black text-math-purple-dark text-center">
                            3 × r × r
                        </div>
                    )
                },
                {
                    text: "It's like finding how much paint covers a round plate!",
                    visual: () => (
                        <div className="w-24 h-24 rounded-full border-4 border-math-purple bg-math-purple/30 flex items-center justify-center relative shadow-lg">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                className="absolute inset-0 rounded-full bg-math-purple/50 opacity-50"
                            ></motion.div>
                        </div>
                    )
                }
            ]
        },
        cylinder: {
            title: "Learning Cylinders",
            steps: [
                {
                    text: "A cylinder is like a soup can! 🥫",
                    visual: () => (
                        <div className="flex justify-center items-center gap-6 mt-4">
                            <div className="w-20 h-28 border-x-4 border-math-purple bg-math-purple/30 rounded-[24px/12px] relative shadow-lg">
                                <div className="w-20 h-6 border-4 border-math-purple rounded-full absolute -top-3 bg-math-purple/20"></div>
                                <div className="w-20 h-6 border-4 border-math-purple rounded-full absolute -bottom-3 bg-math-purple/20 shadow-inner"></div>
                            </div>
                        </div>
                    )
                },
                {
                    text: "Volume = 3 × Radius × Radius × Height.",
                    visual: () => (
                        <div className="flex justify-center items-center gap-6 mt-4 opacity-70">
                            <div className="w-20 h-28 border-x-4 border-math-purple bg-math-purple/30 rounded-[24px/12px] relative">
                                <div className="w-20 h-6 border-4 border-math-purple rounded-full absolute -top-3 bg-math-purple/20"></div>
                                <div className="w-20 h-6 border-4 border-math-purple rounded-full absolute -bottom-3 bg-math-purple/20 shadow-inner"></div>
                            </div>
                        </div>
                    )
                },
                {
                    text: "It's like stacking circles on top of each other.",
                    visual: () => (
                        <div className="flex flex-col-reverse items-center justify-center h-28">
                            {[1, 2, 3, 4].map(i => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    className="w-20 h-4 border-2 border-math-purple rounded-full bg-math-purple/20 mt-[-2px] shadow-sm"
                                ></motion.div>
                            ))}
                        </div>
                    )
                }
            ]
        },
        sphere: {
            title: "Learning Spheres",
            steps: [
                {
                    text: "A sphere is a perfectly round ball! ⚽",
                    visual: () => (
                        <div className="flex justify-center items-center gap-6 mt-4">
                            <div className="w-24 h-24 rounded-full border-4 border-math-purple bg-math-purple/40 flex items-center justify-center relative shadow-xl overflow-hidden shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.2)]">
                                <div className="w-24 h-10 border-2 border-math-purple/40 rounded-full absolute top-1/2 -translate-y-1/2"></div>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/30"></div>
                            </div>
                        </div>
                    )
                },
                {
                    text: "Volume = 4 × Radius × Radius × Radius.",
                    visual: () => (
                        <div className="text-center font-black text-2xl text-math-purple-dark">
                            4 × r × r × r
                        </div>
                    )
                },
                {
                    text: "Think of how much air fills a basketball!",
                    visual: () => (
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-20 h-20 rounded-full bg-orange-500 border-4 border-orange-700 shadow-lg flex items-center justify-center"
                        >
                            <div className="text-white font-black text-xs">SPHERE</div>
                        </motion.div>
                    )
                }
            ]
        },
        cone: {
            title: "Learning Cones",
            steps: [
                {
                    text: "A cone is like an ice cream cone! 🍦",
                    visual: () => (
                        <div className="flex justify-center items-center gap-6 mt-4">
                            <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-t-[90px] border-t-math-purple/50 relative filter drop-shadow-lg">
                                <div className="w-[80px] h-6 border-4 border-math-purple rounded-full absolute -top-[102px] -left-[40px] bg-math-purple/20"></div>
                            </div>
                        </div>
                    )
                },
                {
                    text: "Volume = Radius × Radius × Height.",
                    visual: () => (
                        <div className="text-center font-black text-2xl text-math-purple-dark">
                            r × r × h
                        </div>
                    )
                },
                {
                    text: "It's exactly 1/3 of a cylinder's volume!",
                    visual: () => (
                        <div className="flex items-end gap-2">
                            <div className="w-12 h-20 border-x-2 border-math-purple bg-math-purple/10 rounded-[12px/6px] relative">
                                <div className="w-8 h-16 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[50px] border-t-math-purple/50 absolute bottom-0 left-1/2 -translate-x-1/2"></div>
                            </div>
                            <div className="text-sm font-bold opacity-50">1/3 fill</div>
                        </div>
                    )
                }
            ]
        }
    }

    const speakQuestion = () => {
        if (quietMode) return
        const speech = new SpeechSynthesisUtterance();
        let text = `What is the ${question.type} of this ${question.shape}?`
        speech.text = text;
        speech.rate = 0.8;
        window.speechSynthesis.speak(speech);
    }

    const getScoreFeedback = (score, total) => {
        const p = (score / total) * 100
        if (p === 100) return { title: "Shape Master! 🏆", msg: "You have a perfect eye for geometry!" }
        if (p >= 80) return { title: "Excellent Work! 📏", msg: "You're measuring like a pro!" }
        if (p >= 60) return { title: "Good Job! 📐", msg: "Your geometry skills are getting sharp!" }
        if (p >= 40) return { title: "Keep it up! ✨", msg: "Practice makes perfect geometry!" }
        return { title: "Don't Give Up! 🌈", msg: "Geometry can be tricky, but you're learning!" }
    }

    const handleNext = () => {
        if (currentQuestionIndex + 1 >= totalQuestions) {
            setMode('results')
        } else {
            setCurrentQuestionIndex(i => i + 1)
            generateQuestion()
        }
    }

    const generateQuestion = () => {
        const types = ['area', 'volume']
        const shapes = {
            area: ['square', 'rectangle', 'triangle', 'circle'],
            volume: ['cube', 'box', 'cylinder', 'sphere', 'cone']
        }

        const type = types[Math.floor(Math.random() * types.length)]
        const shape = shapes[type][Math.floor(Math.random() * shapes[type].length)]

        let dim1, dim2, dim3, ans
        const range = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 12 : 20

        if (type === 'area') {
            dim1 = Math.floor(Math.random() * range) + 2
            if (shape === 'square') {
                ans = dim1 * dim1
            } else if (shape === 'rectangle') {
                dim2 = Math.floor(Math.random() * range) + 2
                ans = dim1 * dim2
            } else if (shape === 'triangle') {
                dim1 = (Math.floor(Math.random() * (range / 2)) + 1) * 2 // Ensure even for cleaner integer results
                dim2 = Math.floor(Math.random() * range) + 2
                ans = (dim1 * dim2) / 2
            } else if (shape === 'circle') {
                dim1 = Math.floor(Math.random() * (difficulty === 'easy' ? 4 : 6)) + 1 // Radius
                // Use pi = 3 for easy/medium, 3.14 for hard (but keep integer for now for autistic children flow)
                ans = 3 * dim1 * dim1
            }
        } else {
            dim1 = Math.floor(Math.random() * (difficulty === 'easy' ? 4 : 5)) + 2 // Radius or Side
            if (shape === 'cube') {
                ans = dim1 * dim1 * dim1
            } else if (shape === 'box') {
                dim2 = Math.floor(Math.random() * (difficulty === 'easy' ? 4 : 6)) + 2
                dim3 = Math.floor(Math.random() * (difficulty === 'easy' ? 3 : 5)) + 2
                ans = dim1 * dim2 * dim3
            } else if (shape === 'cylinder') {
                dim1 = Math.floor(Math.random() * 3) + 2 // Radius
                dim2 = Math.floor(Math.random() * 5) + 2 // Height
                ans = 3 * dim1 * dim1 * dim2
            } else if (shape === 'sphere') {
                dim1 = Math.floor(Math.random() * 3) + 2 // Radius
                ans = 4 * dim1 * dim1 * dim1
            } else if (shape === 'cone') {
                dim1 = Math.floor(Math.random() * 3) + 2 // Radius
                dim2 = Math.floor(Math.random() * 6) + 3 // Height
                ans = dim1 * dim1 * dim2
            }
        }

        setQuestion({ type, shape, dim1, dim2, dim3, answer: ans })
        setUserInput('')
        setStatus('idle')
        setFeedback('')

        // Determine question type (MCQ or Fill)
        const qType = answerType === 'mix' ? (Math.random() > 0.5 ? 'mcq' : 'fill') : answerType
        setCurrentQuestionType(qType)

        if (qType === 'mcq') {
            generateOptions(ans)
        }
    }

    const generateOptions = (correctAnswer) => {
        const distractors = new Set()
        while (distractors.size < 3) {
            let offset = Math.floor(Math.random() * 20) - 10
            if (offset === 0) offset = 5
            let dist = correctAnswer + offset
            if (dist !== correctAnswer && dist > 0) {
                distractors.add(dist)
            }
        }
        const allOptions = [correctAnswer, ...Array.from(distractors)]
        setOptions(allOptions.sort(() => Math.random() - 0.5))
    }

    useEffect(() => {
        generateQuestion()
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (mode !== 'play') return

            if (status === 'idle') {
                if (currentQuestionType === 'mcq') {
                    const key = parseInt(e.key)
                    if (key >= 1 && key <= options.length) {
                        setUserInput(options[key - 1].toString())
                    }
                }
                if (e.key === 'Enter') {
                    const form = document.querySelector('form')
                    if (form) form.requestSubmit()
                }
            } else if (status === 'showing-result') {
                if (e.key === 'Enter') {
                    if (isMixedMode) {
                        onFinish(false)
                    } else {
                        handleNext()
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [mode, status, options, currentQuestionType, isMixedMode])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (status !== 'idle' || userInput.trim() === '') return

        if (parseInt(userInput) === question.answer) {
            setStatus('correct')
            setScore(s => s + 1)
            if (!quietMode) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#F0F7FF', '#F2FAF3', '#FFFDF0', '#F9F5FA']
                })
            }

            if (onReward) onReward(2) // Geometry gives more stars
            if (isMixedMode) {
                setTimeout(() => onFinish(true), 1500)
            } else {
                setTimeout(handleNext, 1500)
            }
        } else {
            setStatus('wrong')
            let explanation = ""
            if (question.type === 'area') {
                if (question.shape === 'triangle') {
                    explanation = `To find the area of a triangle, we multiply (Base × Height) ÷ 2. So, (${question.dim1} × ${question.dim2}) ÷ 2 = ${question.answer}.`
                } else if (question.shape === 'circle') {
                    explanation = `To find the area of a circle, we use 3 × Radius × Radius. So, 3 × ${question.dim1} × ${question.dim1} = ${question.answer}.`
                } else {
                    explanation = `To find the area, we multiply ${question.dim1} × ${question.shape === 'square' ? question.dim1 : question.dim2} = ${question.answer}.`
                }
            } else {
                if (question.shape === 'cube') {
                    explanation = `To find the volume of a cube, we multiply ${question.dim1} × ${question.dim1} × ${question.dim1} = ${question.answer}.`
                } else if (question.shape === 'box') {
                    explanation = `To find the volume of a box, we multiply ${question.dim1} × ${question.dim2} × ${question.dim3} = ${question.answer}.`
                } else if (question.shape === 'cylinder') {
                    explanation = `To find the volume of a cylinder, we use 3 × r² × h. So, 3 × ${question.dim1} × ${question.dim1} × ${question.dim2} = ${question.answer}.`
                } else if (question.shape === 'sphere') {
                    explanation = `To find the volume of a sphere, we use 4 × r³. So, 4 × ${question.dim1} × ${question.dim1} × ${question.dim1} = ${question.answer}.`
                } else if (question.shape === 'cone') {
                    explanation = `To find the volume of a cone, we use r² × h. So, ${question.dim1} × ${question.dim1} × ${question.dim2} = ${question.answer}.`
                }
            }
            setFeedback(`Almost there! The correct ${question.type} is ${question.answer}. ${explanation}`)
            setTimeout(() => setStatus('showing-result'), 1000)
        }
    }

    const startPlay = () => {
        setScore(0)
        setCurrentQuestionIndex(0)
        setMode('play')
        generateQuestion()
    }

    return (
        <motion.div
            initial={quietMode ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto px-4"
        >
            <div className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="flex items-center text-soft-text hover:text-math-purple font-bold">
                    <ArrowLeft className="mr-2" /> Back
                </button>

                <div className="flex bg-white rounded-2xl p-1 shadow-sm border-2 border-math-blue">
                    <button
                        onClick={() => { setMode('learn'); setStatus('idle'); }}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${mode === 'learn' ? 'bg-math-purple text-white shadow-md' : 'text-soft-text opacity-50'}`}
                    >
                        <BookOpen size={20} /> Learn
                    </button>
                    <button
                        onClick={() => { setMode('setup'); setStatus('idle'); setUserInput(''); }}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${mode === 'play' || mode === 'setup' ? 'bg-math-purple text-white shadow-md' : 'text-soft-text opacity-50'}`}
                    >
                        <PlayCircle size={20} /> Play
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'setup' ? (
                    <motion.div
                        key="setup-geo"
                        initial={quietMode ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={quietMode ? { opacity: 0 } : { opacity: 0, y: -10 }}
                        className="card p-10 text-center border-b-8 border-math-purple/30"
                    >
                        <h2 className="text-3xl font-black mb-10 text-soft-text">Shapes Settings</h2>

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

                        <button onClick={startPlay} className="btn-primary bg-math-purple-dark text-white w-full py-4 text-xl flex items-center justify-center gap-2">
                            Start Measuring! <PlayCircle />
                        </button>
                    </motion.div>
                ) : mode === 'learn' ? (
                    <motion.div
                        key="learn"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card p-8 flex flex-col items-center"
                    >
                        {!activeLearnTopic ? (
                            <>
                                <div className="flex items-center gap-4 mb-8 w-full border-b border-math-blue pb-4">
                                    <div className="p-3 bg-pink-100 rounded-2xl text-pink-500">
                                        <BookOpen size={32} />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-3xl font-black text-soft-text leading-tight">Geometry Explorer</h2>
                                        <p className="text-lg font-bold text-soft-text opacity-50">Exploration Mode</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 w-full">
                                    {Object.entries(learnData).map(([key, data]) => (
                                        <motion.div
                                            key={key}
                                            whileHover={{ y: -5 }}
                                            onClick={() => {
                                                setActiveLearnTopic(key);
                                                setCurrentStep(0);
                                            }}
                                            className="p-6 bg-math-blue/30 rounded-[2rem] border-2 border-math-blue/50 cursor-pointer relative overflow-hidden group"
                                        >
                                            <h3 className="text-2xl font-black mb-4 text-soft-text">{data.title}</h3>
                                            <div className="min-h-[150px] flex items-center justify-center pointer-events-none">
                                                {data.steps[0].visual()}
                                            </div>
                                            <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[2rem]">
                                                <div className="p-4 bg-math-purple-dark text-white rounded-full font-black flex items-center gap-2">
                                                    Learn More <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMode('setup')}
                                    className="btn-primary bg-math-purple-dark text-white w-full py-5 text-xl flex items-center justify-center gap-2 mt-4"
                                >
                                    I'm Ready to Play! <ArrowRight />
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 mb-8 w-full border-b border-math-blue pb-4">
                                    <button
                                        onClick={() => setActiveLearnTopic(null)}
                                        className="p-3 bg-math-blue rounded-2xl text-math-purple-dark hover:bg-math-purple/20 transition-colors"
                                    >
                                        <ArrowLeft size={24} />
                                    </button>
                                    <div className="text-left">
                                        <h2 className="text-3xl font-black text-soft-text leading-tight">{learnData[activeLearnTopic].title}</h2>
                                        <p className="text-lg font-bold text-soft-text opacity-50">Step {currentStep + 1} of {learnData[activeLearnTopic].steps.length}</p>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="w-full flex flex-col items-center"
                                    >
                                        <div className="text-2xl font-black text-math-purple-dark mb-10 text-center max-w-lg leading-relaxed bg-math-purple/30 p-6 rounded-[2rem]">
                                            {learnData[activeLearnTopic].steps[currentStep].text}
                                        </div>

                                        <div className="min-h-[250px] flex items-center justify-center w-full mb-10">
                                            {learnData[activeLearnTopic].steps[currentStep].visual()}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={() => setCurrentStep(prev => prev - 1)}
                                            className="btn-secondary py-4 bg-white border-4 border-math-blue text-soft-text flex-1"
                                        >
                                            Go Back
                                        </button>
                                    )}
                                    {currentStep < learnData[activeLearnTopic].steps.length - 1 ? (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentStep(prev => prev + 1)}
                                            className="btn-primary bg-math-purple-dark text-white flex-1 py-4 flex items-center justify-center gap-2"
                                        >
                                            Next Step <ArrowRight />
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setActiveLearnTopic(null); setMode('setup'); }}
                                            className="btn-primary bg-math-purple-dark text-white w-full py-4 text-xl flex items-center justify-center gap-2"
                                        >
                                            I'm Ready to Play! <ArrowRight />
                                        </motion.button>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : mode === 'results' ? (
                    <motion.div
                        id="geometry-game-results"
                        key="results-geo"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="card p-10 text-center border-b-8 border-math-green-dark"
                    >
                        <Trophy size={80} className="mx-auto text-math-yellow-dark mb-6" />
                        <h2 className="text-4xl font-black mb-2 text-soft-text">{getScoreFeedback(score, totalQuestions).title}</h2>
                        <p className="text-xl text-soft-text/80 mb-8">{getScoreFeedback(score, totalQuestions).msg}</p>

                        <div className="bg-math-blue/30 rounded-3xl p-8 mb-8">
                            <div className="text-6xl font-black text-math-purple-dark mb-2">{score} / {totalQuestions}</div>
                            <p className="text-lg font-bold text-soft-text">{Math.round((score / totalQuestions) * 100)}% Correct</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => captureScreen('geometry-game-results', `GeoScore-${score}.png`)}
                                className="btn-secondary py-4 bg-math-blue text-math-purple-dark font-bold flex items-center justify-center gap-2 hover:bg-math-blue/60 transition-colors"
                            >
                                <Camera size={20} /> Capture My Score!
                            </button>
                            <button onClick={() => setMode('setup')} className="btn-primary bg-math-purple-dark text-white py-4 flex items-center justify-center gap-2">
                                <RotateCcw /> Play Again
                            </button>
                            <button onClick={onBack} className="btn-secondary py-4 text-soft-text font-bold">
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="play-geo"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="card text-center py-12 border-b-8 border-math-purple-dark"
                    >
                        <div className="flex justify-between items-center mb-6 px-4">
                            <div className="text-xs font-bold text-math-purple-dark uppercase tracking-widest">
                                Project {currentQuestionIndex + 1} / {totalQuestions}
                            </div>
                            <button
                                onClick={speakQuestion}
                                className="p-2 rounded-full bg-math-blue text-math-purple-dark hover:bg-math-purple/20 transition-colors"
                                title="Read Question"
                            >
                                <Volume2 size={24} />
                            </button>
                            <div className="text-xs font-bold text-math-purple-dark uppercase tracking-widest">
                                Score: {score}
                            </div>
                        </div>

                        <h2 className="text-xl sm:text-3xl font-bold mb-8 px-4 leading-tight">
                            Find the {question.type} of this {question.shape}!
                        </h2>

                        <div className="flex justify-center mb-8 px-4 overflow-hidden">
                            <motion.div
                                animate={{ scale: [1, 1.02, 1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className={`bg-pink-100/50 border-8 border-pink-400 rounded-3xl flex items-center justify-center relative shadow-2xl backdrop-blur-sm`}
                                style={{
                                    width: '100%',
                                    maxWidth: question.shape.includes('square') || question.shape.includes('cube') ? '180px' : '240px',
                                    height: '180px',
                                    perspective: '1000px'
                                }}
                            >
                                {question.type === 'area' ? (
                                    <div className="w-full h-full flex items-center justify-center relative">
                                        {question.shape === 'circle' ? (
                                            <div className="w-36 h-36 rounded-full border-8 border-pink-500 bg-white/70 flex items-center justify-center relative shadow-xl">
                                                <div className="w-18 h-2 bg-pink-600 absolute left-1/2 origin-left shadow-sm"></div>
                                                <div className="absolute top-[30%] left-[60%] bg-white px-3 py-1 rounded-full border-2 border-pink-400 text-sm font-black text-pink-700 shadow-sm">
                                                    r = {question.dim1}
                                                </div>
                                            </div>
                                        ) : question.shape === 'triangle' ? (
                                            <div className="w-0 h-0 border-l-[80px] border-l-transparent border-r-[80px] border-r-transparent border-b-[140px] border-b-pink-500 relative filter drop-shadow-2xl">
                                                <div className="absolute top-16 -left-8 bg-white px-3 py-1 rounded-full border-2 border-pink-400 text-sm font-black text-pink-700 shadow-sm">
                                                    h={question.dim2}
                                                </div>
                                                <div className="absolute top-32 -left-4 bg-white px-3 py-1 rounded-full border-2 border-pink-400 text-sm font-black text-pink-700 shadow-sm">
                                                    b={question.dim1}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xl font-bold">
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full border-4 border-pink-500 text-pink-700 font-black text-2xl shadow-md">
                                                    {question.dim1}
                                                </div>
                                                <div className="absolute top-1/2 -right-16 -translate-y-1/2 bg-white px-4 py-2 rounded-full border-4 border-pink-500 text-pink-700 font-black text-2xl shadow-md">
                                                    {question.shape === 'square' ? question.dim1 : question.dim2}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white/80 px-4 sm:px-8 py-4 sm:py-6 rounded-[30px] sm:rounded-[40px] border-4 sm:border-8 border-pink-400 shadow-2xl flex flex-col items-center backdrop-blur-sm w-[90%] sm:w-auto">
                                        {question.shape === 'cylinder' ? (
                                            <div className="w-24 h-40 border-x-8 border-pink-500 bg-pink-100 rounded-[30px/15px] relative mb-6 shadow-lg">
                                                <div className="w-24 h-8 border-4 border-pink-500 rounded-full absolute -top-4 bg-pink-50 shadow-sm"></div>
                                                <div className="w-24 h-8 border-4 border-pink-500 rounded-full absolute -bottom-4 bg-pink-50 shadow-inner"></div>
                                                <div className="absolute left-[115%] top-1/2 -translate-y-1/2 text-lg font-black text-pink-700 whitespace-nowrap bg-white/90 px-2 py-1 rounded-full border-2 border-pink-300">h = {question.dim2}</div>
                                                <div className="absolute top-[8%] left-[60%] text-sm font-black text-pink-700 bg-white/90 px-1 py-0.5 rounded-sm border border-pink-200">r = {question.dim1}</div>
                                            </div>
                                        ) : question.shape === 'sphere' ? (
                                            <div className="w-40 h-40 rounded-full border-8 border-pink-500 bg-pink-100 relative mb-6 flex items-center justify-center shadow-2xl overflow-hidden shadow-[inset_-20px_-20px_40px_rgba(236,72,153,0.3)]">
                                                <div className="w-40 h-14 border-4 border-pink-300/50 rounded-full absolute top-1/2 -translate-y-1/2"></div>
                                                <div className="w-20 h-2 bg-pink-600 absolute left-1/2 origin-left shadow-sm"></div>
                                                <div className="absolute top-[30%] left-[60%] text-lg font-black text-pink-700 bg-white/90 px-2 py-1 rounded-full border-2 border-pink-300">r = {question.dim1}</div>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40"></div>
                                            </div>
                                        ) : question.shape === 'cone' ? (
                                            <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-t-[120px] border-t-pink-300 relative mb-10 filter drop-shadow-xl">
                                                <div className="w-[100px] h-8 border-4 border-pink-500 rounded-full absolute -top-[136px] -left-[50px] bg-pink-50 shadow-sm"></div>
                                                <div className="absolute top-[-125px] left-[5%] text-sm font-black text-pink-700 bg-white/90 px-1 rounded-sm border border-pink-200">r = {question.dim1}</div>
                                                <div className="absolute left-[115%] top-[-80px] text-lg font-black text-pink-700 whitespace-nowrap bg-white/90 px-2 py-1 rounded-full border-2 border-pink-300">h = {question.dim2}</div>
                                            </div>
                                        ) : (
                                            <div className="text-xl font-black text-math-purple-dark">
                                                {question.shape === 'cube'
                                                    ? `${question.dim1} x ${question.dim1} x ${question.dim1}`
                                                    : `${question.dim1} x ${question.dim2} x ${question.dim3}`
                                                }
                                            </div>
                                        )}
                                        <div className="mt-2 text-sm font-bold text-soft-text opacity-70">Volume Calculation</div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
                            {currentQuestionType === 'mcq' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4 text-soft-text">
                                    {options.map((opt, i) => (
                                        <button
                                            key={i}
                                            disabled={status !== 'idle'}
                                            type="button"
                                            onClick={() => setUserInput(opt.toString())}
                                            className={`px-4 py-5 sm:py-6 rounded-3xl font-black text-2xl transition-all border-4 ${userInput === opt.toString() ? 'bg-math-purple-dark text-white border-math-purple-dark scale-95 shadow-inner' : 'bg-white text-math-purple-dark border-math-purple hov:border-math-purple-dark hov:bg-math-purple/10'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <input
                                    autoFocus
                                    disabled={status !== 'idle'}
                                    type="number"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="text-4xl w-full max-w-[200px] text-center py-4 rounded-3xl border-4 border-math-blue focus:border-math-purple outline-none transition-all bg-math-blue/10 font-black text-math-purple-dark"
                                    placeholder="..."
                                />
                            )}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                disabled={status === 'correct' || status === 'wrong'}
                                type={status === 'showing-result' ? 'button' : 'submit'}
                                onClick={status === 'showing-result' ? (isMixedMode ? () => onFinish(false) : handleNext) : undefined}
                                className={`btn-primary text-white text-xl w-full max-w-md mx-4 transition-transform ${status === 'correct' ? 'bg-green-600' :
                                    status === 'wrong' ? 'bg-red-600' :
                                        status === 'showing-result' ? 'bg-math-orange-dark' : 'bg-math-purple-dark'
                                    }`}
                            >
                                {status === 'correct' ? <CheckCircle2 className="mx-auto" /> :
                                    status === 'wrong' ? <AlertCircle className="mx-auto" /> :
                                        status === 'showing-result' ? (isMixedMode ? 'Next Question' : 'Try Another One!') : 'Check Answer'}
                            </motion.button>
                        </form>

                        <AnimatePresence>
                            {(status === 'correct' || status === 'showing-result') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`mt-6 p-4 rounded-2xl flex items-center gap-3 justify-center border-2 ${status === 'correct' ? 'text-green-700 bg-green-50 border-green-200' : 'text-math-orange-dark bg-orange-50 border-orange-200 shadow-sm'}`}
                                >
                                    {status === 'correct' ? (
                                        <>
                                            <CheckCircle2 />
                                            <span className="font-bold text-lg">Great job! 🌟</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lightbulb className="flex-shrink-0" />
                                            <span className="font-bold text-lg text-left leading-relaxed">{feedback}</span>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {mode === 'play' && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => setMode('learn')}
                        className="text-soft-text/50 hover:text-math-purple-dark flex items-center gap-2 font-bold text-sm transition-colors"
                    >
                        <Lightbulb size={16} /> Need help? Look at the Shapes Guide
                    </button>
                </div>
            )}
        </motion.div>
    )
}

export default GeometryGame
