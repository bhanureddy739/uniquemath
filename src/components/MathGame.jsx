import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertCircle, PlayCircle, BookOpen, ArrowRight, Lightbulb, Trophy, RotateCcw, Camera, Volume2, Plus } from 'lucide-react'
import confetti from 'canvas-confetti'
import { captureScreen } from './ScreenCapture'
import InteractiveElement from './InteractiveElement'

const MathGame = ({ type, onBack, initialMode = 'learn', difficulty: propDifficulty = 'easy', onFinish, isMixedMode = false, initialAnswerType = 'mix', quietMode = false, onReward }) => {
    const [mode, setMode] = useState(initialMode) // setup, learn, play, results
    const [currentStep, setCurrentStep] = useState(0)
    const [difficulty, setDifficulty] = useState(propDifficulty)
    const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', answer: 0 })
    const [userInput, setUserInput] = useState('')
    const [status, setStatus] = useState('idle') // idle, correct, wrong, showing-result
    const [score, setScore] = useState(0)
    const [totalQuestions, setTotalQuestions] = useState(5)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [results, setResults] = useState([])
    const [answerType, setAnswerType] = useState(initialAnswerType) // fill, mcq, mix
    const [options, setOptions] = useState([])
    const [currentQuestionType, setCurrentQuestionType] = useState('fill')

    // Learning data for each type
    const getManipulative = (gameType) => {
        const icons = {
            add: '🍎',
            sub: '⭐',
            mul: '🧱',
            div: '🍪',
            power: '📦',
            factorial: '🎈',
            prime: '🟢'
        }
        return icons[gameType] || '🍎'
    }

    const learnData = {
        add: {
            title: "Learning Addition",
            steps: [
                {
                    text: "Addition means putting things together!",
                    visual: (a, b) => (
                        <div className="flex gap-4 items-center justify-center">
                            <div className="flex gap-1">{Array(a).fill(0).map((_, i) => <InteractiveElement key={i}><div className="manipulative">{getManipulative('add')}</div></InteractiveElement>)}</div>
                            <Plus className="text-math-purple-dark" size={32} />
                            <div className="flex gap-1">{Array(b).fill(0).map((_, i) => <InteractiveElement key={i}><div className="manipulative">{getManipulative('add')}</div></InteractiveElement>)}</div>
                        </div>
                    )
                },
                {
                    text: `Let's merge them! ${question.a} + ${question.b}`,
                    visual: (a, b) => (
                        <div className="flex gap-1 items-center justify-center">
                            {Array(a + b).fill(0).map((_, i) => (
                                <motion.div key={i} layoutId={`item-${i}`} className="manipulative">{getManipulative('add')}</motion.div>
                            ))}
                        </div>
                    )
                },
                {
                    text: `Count them all. There are ${question.a + question.b}!`,
                    visual: (a, b) => (
                        <div className="flex flex-col items-center">
                            <div className="flex gap-1 flex-wrap justify-center max-w-md">
                                {Array(a + b).fill(0).map((_, i) => (
                                    <InteractiveElement key={i} type="pop">
                                        <div className="manipulative relative">
                                            {getManipulative('add')}
                                            <span className="absolute -top-2 -right-2 bg-white text-xs px-1 rounded-full border shadow-sm font-black">{i + 1}</span>
                                        </div>
                                    </InteractiveElement>
                                ))}
                            </div>
                            <div className="mt-4 text-3xl font-black text-math-purple-dark">{a} + {b} = {a + b}</div>
                        </div>
                    )
                }
            ]
        },
        sub: {
            title: "Learning Subtraction",
            steps: [
                {
                    text: `Subtraction means taking away! We start with ${question.a}.`,
                    visual: (a) => (
                        <div className="flex gap-1 flex-wrap justify-center">
                            {Array(a).fill(0).map((_, i) => <InteractiveElement key={i}><div className="manipulative">{getManipulative('sub')}</div></InteractiveElement>)}
                        </div>
                    )
                },
                {
                    text: `Take away ${question.b} ${getManipulative('sub')}s.`,
                    visual: (a, b) => (
                        <div className="flex gap-1 flex-wrap justify-center">
                            {Array(a).fill(0).map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={i >= a - b ? { opacity: 0.2, scale: 0.8, rotate: 10 } : {}}
                                    className="manipulative"
                                >
                                    {getManipulative('sub')}
                                </motion.div>
                            ))}
                        </div>
                    )
                },
                {
                    text: `How many are left? ${question.a - question.b}!`,
                    visual: (a, b) => (
                        <div className="flex flex-col items-center">
                            <div className="flex gap-1 flex-wrap justify-center">
                                {Array(a - b).fill(0).map((_, i) => (
                                    <InteractiveElement key={i} type="pop">
                                        <div className="manipulative">{getManipulative('sub')}</div>
                                    </InteractiveElement>
                                ))}
                            </div>
                            <div className="mt-4 text-3xl font-black text-math-purple-dark">{a} - {b} = {a - b}</div>
                        </div>
                    )
                }
            ]
        },
        mul: {
            title: "Learning Multiplication",
            steps: [
                {
                    text: "Multiplication is adding the same number many times!",
                    visual: (a, b) => (
                        <div className="flex flex-col items-center">
                            <div className="flex gap-4">
                                {Array(2).fill(0).map((_, i) => (
                                    <div key={i} className={`p-4 rounded-3xl border-4 border-dashed bg-white shadow-sm flex flex-wrap gap-1 max-w-[150px] justify-center ${['border-math-green', 'border-math-blue'][i % 2]}`}>
                                        {Array(3).fill(0).map((_, j) => <div key={j} className="text-3xl">{getManipulative('mul')}</div>)}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-xl font-bold opacity-60 text-center">We have 2 boxes with 3 items each.</div>
                        </div>
                    )
                },
                {
                    text: "Let's count them all: 3 + 3 = 6",
                    visual: () => (
                        <div className="flex flex-col items-center">
                            <div className="flex gap-2 text-3xl font-black text-math-purple-dark">3 + 3 = 6</div>
                            <div className="flex gap-1 flex-wrap justify-center mt-6 max-w-lg">
                                {Array(6).fill(0).map((_, i) => <InteractiveElement key={i} type="pop"><div className="text-3xl">{getManipulative('mul')}</div></InteractiveElement>)}
                            </div>
                        </div>
                    )
                }
            ]
        },
        div: {
            title: "Learning Division",
            steps: [
                {
                    text: "Division is equal sharing! Let's share 6 items.",
                    visual: () => (
                        <div className="flex gap-1 flex-wrap justify-center max-w-lg">
                            {Array(6).fill(0).map((_, i) => <div key={i} className="text-3xl">{getManipulative('div')}</div>)}
                        </div>
                    )
                },
                {
                    text: "Share them between 2 friends equally.",
                    visual: () => (
                        <div className="flex gap-8 justify-center items-end">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="text-5xl">👤</div>
                                    <div className="bg-math-blue/50 p-4 rounded-2xl min-h-[80px] min-w-[100px] flex flex-wrap gap-1 justify-center border-2 border-math-blue">
                                        {Array(3).fill(0).map((_, j) => <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: j * 0.1 }} key={j} className="text-2xl">{getManipulative('div')}</motion.div>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                },
                {
                    text: "Everyone gets 3!",
                    visual: () => (
                        <div className="text-center">
                            <div className="text-4xl font-black text-math-purple-dark">6 ÷ 2 = 3</div>
                            <p className="mt-2 font-bold opacity-60">Sharing is caring! 💖</p>
                        </div>
                    )
                }
            ]
        },
        power: {
            title: "Learning Powers",
            steps: [
                {
                    text: "Powers are repeated multiplication!",
                    visual: () => (
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-5xl font-black">2<sup>3</sup></div>
                            <div className="text-2xl font-bold opacity-60">This means 2 × 2 × 2</div>
                        </div>
                    )
                },
                {
                    text: "Think of it as growing layers! 2 → 4 → 8",
                    visual: () => (
                        <div className="flex flex-col items-center">
                            {[2, 4, 8].map((val, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3 }} className="flex gap-1 mt-1">
                                    {Array(val).fill(0).map((_, j) => <div key={j} className="w-4 h-4 bg-math-orange rounded shadow-sm"></div>)}
                                </motion.div>
                            ))}
                            <div className="mt-4 font-black text-2xl text-math-orange-dark">Total: 8</div>
                        </div>
                    )
                }
            ]
        },
        factorial: {
            title: "Learning Factorials",
            steps: [
                {
                    text: "Factorial is a countdown multiplication!",
                    visual: () => (
                        <div className="flex flex-col items-center gap-6">
                            <div className="text-5xl font-black">4!</div>
                            <div className="flex items-end gap-2 text-2xl font-black text-math-purple-dark">
                                4 × 3 × 2 × 1 = 24
                            </div>
                            <div className="flex items-end gap-2">
                                {[4, 3, 2, 1].map((val, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <div className="flex flex-col gap-1">
                                            {Array(val).fill(0).map((_, j) => <div key={j} className="w-5 h-5 bg-red-400 rounded-full shadow-sm"></div>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            ]
        },
        prime: {
            title: "Prime vs Composite",
            steps: [
                {
                    text: "Can we make equal groups with this number?",
                    visual: () => (
                        <div className="flex flex-col items-center">
                            <div className="text-5xl font-black mb-6">6</div>
                            <div className="flex gap-1 flex-wrap justify-center max-w-md">
                                {Array(6).fill(0).map((_, i) => <div key={i} className="text-3xl text-blue-500">🟢</div>)}
                            </div>
                            <div className="mt-4 text-xl font-bold text-blue-600">6 is Composite (3 groups of 2)</div>
                        </div>
                    )
                },
                {
                    text: "Some numbers can only be 1 row!",
                    visual: () => (
                        <div className="flex flex-col items-center">
                            <div className="text-5xl font-black mb-6">7</div>
                            <div className="flex gap-1">
                                {Array(7).fill(0).map((_, i) => <div key={i} className="text-3xl text-green-500">🟢</div>)}
                            </div>
                            <div className="mt-4 text-xl font-bold text-green-600">7 is Prime (No equal groups!)</div>
                        </div>
                    )
                }
            ]
        }
    }

    const speakQuestion = () => {
        if (quietMode) return
        const speech = new SpeechSynthesisUtterance();
        let text = ""
        if (type === 'factorial') {
            text = `${question.a} factorial equals what?`
        } else if (type === 'prime') {
            text = `Is ${question.a} a ${question.op === 'prime?' ? 'prime number' : 'composite number'}?`
        } else {
            const opWords = { '+': 'plus', '-': 'minus', '×': 'times', '÷': 'divided by', '^': 'to the power of' }
            text = `${question.a} ${opWords[question.op]} ${question.b} equals what?`
        }
        speech.text = text;
        speech.rate = 0.8; // Calmer, slower speed
        window.speechSynthesis.speak(speech);
    }

    const getScoreFeedback = (score, total) => {
        const p = (score / total) * 100
        if (p === 100) return { title: "Spectacular! 🌟", msg: "A perfect score! You're a math wizard!" }
        if (p >= 80) return { title: "Amazing! 🚀", msg: "You're doing great! Keep it up!" }
        if (p >= 60) return { title: "Great Job! 👍", msg: "You have a solid understanding!" }
        if (p >= 40) return { title: "Good Effort! 💪", msg: "Keep practicing and you'll get even better!" }
        return { title: "Keep Going! ✨", msg: "Every mistake is a chance to learn!" }
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
        let a, b, op, ans
        const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100
        const smallRange = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 12 : 20

        switch (type) {
            case 'add':
                a = Math.floor(Math.random() * range) + 1
                b = Math.floor(Math.random() * range) + 1
                op = '+'
                ans = a + b
                break
            case 'sub':
                a = Math.floor(Math.random() * range) + range
                b = Math.floor(Math.random() * range) + 1
                op = '-'
                ans = a - b
                break
            case 'mul':
                a = Math.floor(Math.random() * smallRange) + 1
                b = Math.floor(Math.random() * 10) + 1
                op = '×'
                ans = a * b
                break
            case 'div':
                ans = Math.floor(Math.random() * 10) + 1
                b = Math.floor(Math.random() * smallRange) + 1
                a = ans * b
                op = '÷'
                break
            case 'power':
                a = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : 10)) + 1
                b = Math.floor(Math.random() * (difficulty === 'easy' ? 2 : 3)) + 1
                op = '^'
                ans = Math.pow(a, b)
                break
            case 'factorial':
                a = Math.floor(Math.random() * (difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8))
                op = '!'
                ans = 1
                for (let i = 2; i <= a; i++) ans *= i
                break
            case 'prime':
                a = Math.floor(Math.random() * (difficulty === 'easy' ? 20 : 100)) + 2
                op = 'is Prime?'
                ans = true
                for (let i = 2; i <= Math.sqrt(a); i++) {
                    if (a % i === 0) {
                        ans = false
                        break
                    }
                }
                break
            default:
                a = 0; b = 0; op = '+'; ans = 0
        }
        setQuestion({ a, b, op, answer: ans })
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
        const isNumeric = typeof correctAnswer === 'number'

        if (isNumeric) {
            while (distractors.size < 3) {
                let offset = Math.floor(Math.random() * 10) - 5
                if (offset === 0) offset = 5
                let dist = correctAnswer + offset
                if (dist !== correctAnswer && dist >= 0) {
                    distractors.add(dist)
                }
            }
        } else {
            // For Yes/No questions (already handled but for consistency)
            distractors.add(correctAnswer === true ? false : true)
        }

        const allOptions = [correctAnswer, ...Array.from(distractors)]
        // Shuffle
        setOptions(allOptions.sort(() => Math.random() - 0.5))
    }

    useEffect(() => {
        generateQuestion()
    }, [type])

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
                    // Trigger form submission
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

        const isCorrect = type === 'prime'
            ? userInput.toLowerCase() === (question.answer ? 'yes' : 'no')
            : parseInt(userInput) === question.answer

        if (isCorrect) {
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

            if (isMixedMode) {
                setTimeout(() => onFinish(true), 1500)
            } else {
                setTimeout(handleNext, 1500)
            }
        } else {
            setStatus('wrong')
            let explanation = ""
            if (type === 'add') explanation = `${question.a} + ${question.b} = ${question.answer}`
            if (type === 'sub') explanation = `${question.a} - ${question.b} = ${question.answer}`
            if (type === 'mul') explanation = `${question.a} × ${question.b} = ${question.answer}`
            if (type === 'div') explanation = `${question.a} ÷ ${question.b} = ${question.answer}`
            if (type === 'factorial') explanation = `${question.a}! is ${question.answer}`
            if (type === 'power') explanation = `${question.a} to the power of ${question.b} is ${question.answer}`
            if (type === 'prime') explanation = `${question.a} is ${question.answer ? 'Prime' : 'Composite'}`

            setFeedback(`Not quite! The correct answer is ${type === 'prime' ? (question.answer ? 'Yes' : 'No') : question.answer}. ${explanation}`)
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
            exit={quietMode ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            className="max-w-3xl mx-auto px-4"
        >
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-soft-text hover:text-math-purple font-bold transition-colors"
                >
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
                        key="setup"
                        initial={quietMode ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={quietMode ? { opacity: 0 } : { opacity: 0, y: -10 }}
                        className="card p-10 text-center border-b-8 border-math-purple/30"
                    >
                        <h2 className="text-3xl font-black mb-10 text-soft-text">Game Settings</h2>

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

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={startPlay}
                            className="btn-primary bg-math-purple-dark text-white w-full py-4 text-xl flex items-center justify-center gap-2"
                        >
                            Start Game! <PlayCircle />
                        </motion.button>
                    </motion.div>
                ) : mode === 'learn' ? (
                    <motion.div
                        key="learn"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card p-8 flex flex-col items-center"
                    >
                        <div className="flex items-center gap-4 mb-8 w-full border-b border-math-blue pb-4">
                            <div className="p-3 bg-math-purple rounded-2xl text-math-purple-dark">
                                <BookOpen size={32} />
                            </div>
                            <div className="text-left">
                                <h2 className="text-3xl font-black text-soft-text leading-tight">{learnData[type]?.title}</h2>
                                <p className="text-lg font-bold text-soft-text opacity-50">Step {currentStep + 1} of {learnData[type]?.steps.length}</p>
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
                                    {learnData[type]?.steps[currentStep].text}
                                </div>

                                <div className="min-h-[250px] flex items-center justify-center w-full mb-10">
                                    {learnData[type]?.steps[currentStep].visual(question.a, question.b)}
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
                            {currentStep < learnData[type]?.steps.length - 1 ? (
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
                                    onClick={() => setMode('setup')}
                                    className="btn-primary bg-math-purple-dark text-white w-full py-4 text-xl flex items-center justify-center gap-2"
                                >
                                    I'm Ready to Play! <ArrowRight />
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                ) : mode === 'results' ? (
                    <motion.div
                        id="math-game-results"
                        key="results"
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
                                onClick={() => captureScreen('math-game-results', `MathScore-${score}.png`)}
                                className="btn-secondary py-4 bg-math-blue text-math-purple-dark font-bold flex items-center justify-center gap-2 hover:bg-math-blue/60 transition-colors"
                            >
                                <Camera size={20} /> Capture My Score!
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setMode('setup')}
                                className="btn-primary bg-math-purple-dark text-white py-4 flex items-center justify-center gap-2"
                            >
                                <RotateCcw /> Play Again
                            </motion.button>
                            <button onClick={onBack} className="btn-secondary py-4 text-soft-text font-bold">
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="play"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="card text-center py-12 border-b-8 border-math-purple"
                    >
                        <div className="flex justify-between items-center mb-6 px-4">
                            <div className="text-xs font-bold text-math-purple-dark uppercase tracking-widest">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
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

                        <div className="text-4xl sm:text-7xl font-black mb-12 flex flex-wrap justify-center items-center gap-2 sm:gap-4 px-2">
                            {type === 'factorial' ? (
                                <span>{question.a}{question.op} = ?</span>
                            ) : type === 'prime' ? (
                                <span className="text-3xl sm:text-5xl text-center">Is {question.a} {question.op}</span>
                            ) : (
                                <>
                                    <span>{question.a}</span>
                                    <span className="text-math-purple-dark">{question.op}</span>
                                    <span>{question.b}</span>
                                    <span>=</span>
                                    <span>?</span>
                                </>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
                            {type === 'prime' ? (
                                <div className="flex gap-4 w-full justify-center">
                                    {['yes', 'no'].map(choice => (
                                        <button
                                            key={choice}
                                            disabled={status !== 'idle'}
                                            type="button"
                                            onClick={() => { setUserInput(choice); }}
                                            className={`flex-1 max-w-[150px] py-4 sm:py-6 rounded-2xl font-bold capitalize transition-all border-4 ${userInput === choice ? 'bg-math-purple-dark text-white border-math-purple-dark scale-95 shadow-inner' : 'bg-math-purple text-math-purple-dark border-math-purple/50 hov:bg-math-purple/70'}`}
                                        >
                                            {choice}
                                        </button>
                                    ))}
                                </div>
                            ) : currentQuestionType === 'mcq' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4">
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

                            <button
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
                            </button>
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
                        <Lightbulb size={16} /> Need help? Look at the Learning Guide
                    </button>
                </div>
            )}
        </motion.div>
    )
}

export default MathGame
