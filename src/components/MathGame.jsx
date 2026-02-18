import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertCircle, PlayCircle, BookOpen, ArrowRight, Lightbulb, Trophy, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'

const MathGame = ({ type, onBack, initialMode = 'learn', difficulty: propDifficulty = 'easy', onFinish, isMixedMode = false, initialAnswerType = 'mix' }) => {
    const [mode, setMode] = useState(initialMode) // setup, learn, play, results
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
    const learnData = {
        add: {
            title: "Learning Addition",
            steps: [
                "Addition means putting things together! 🍎 + 🍎 = 🍎🍎",
                "When we see the '+' sign, we add the numbers.",
                "Example: 2 + 3. You have 2 apples, and you get 3 more. Now you have 5!"
            ],
            visual: (
                <div className="flex gap-4 justify-center items-center text-4xl mt-4">
                    <div className="flex gap-1"><div className="w-8 h-8 bg-red-400 rounded-full"></div><div className="w-8 h-8 bg-red-400 rounded-full"></div></div>
                    <div className="text-math-purple-dark text-5xl font-bold">+</div>
                    <div className="flex gap-1"><div className="w-8 h-8 bg-red-400 rounded-full"></div><div className="w-8 h-8 bg-red-400 rounded-full"></div><div className="w-8 h-8 bg-red-400 rounded-full"></div></div>
                    <div className="text-math-purple">=</div>
                    <div className="flex gap-1"><div className="w-6 h-6 bg-red-400 rounded-full"></div><div className="w-6 h-6 bg-red-400 rounded-full"></div><div className="w-6 h-6 bg-red-400 rounded-full"></div><div className="w-6 h-6 bg-red-400 rounded-full"></div><div className="w-6 h-6 bg-red-400 rounded-full"></div></div>
                </div>
            )
        },
        sub: {
            title: "Learning Subtraction",
            steps: [
                "Subtraction means taking away! 🍎🍎 - 🍎 = 🍎",
                "The '-' sign means we remove items from the group.",
                "Example: 5 - 2. You have 5 stars, you lose 2. Now you have 3!"
            ],
            visual: (
                <div className="flex gap-4 justify-center items-center text-4xl mt-4">
                    <div className="flex gap-1">{"⭐⭐⭐⭐⭐".split("").map((s, i) => <span key={i} className="text-2xl">{s}</span>)}</div>
                    <div className="text-math-purple-dark text-5xl font-bold">-</div>
                    <div className="flex gap-1 text-2xl">⭐⭐</div>
                    <div className="text-math-purple">=</div>
                    <div className="flex gap-1 text-2xl">⭐⭐⭐</div>
                </div>
            )
        },
        mul: {
            title: "Learning Multiplication",
            steps: [
                "Multiplication is adding the same number many times!",
                "2 × 3 means 2 groups of 3 apples. (3 + 3 = 6)",
                "Example: 2 × 3 = 6. It's like skip counting!"
            ],
            visual: (
                <div className="flex flex-col gap-2 items-center mt-4">
                    <div className="flex gap-4">
                        <div className="border-2 border-dashed border-math-purple p-2 rounded-xl flex gap-1">🍎🍎🍎</div>
                        <div className="border-2 border-dashed border-math-purple p-2 rounded-xl flex gap-1">🍎🍎🍎</div>
                    </div>
                    <div className="text-sm opacity-70">2 groups of 3 = 6</div>
                </div>
            )
        },
        div: {
            title: "Learning Division",
            steps: [
                "Division means sharing equally with friends!",
                "6 ÷ 2 means sharing 6 cookies between 2 people.",
                "Everyone gets 3 cookies! 🍪🍪🍪 | 🍪🍪🍪"
            ],
            visual: (
                <div className="flex gap-8 justify-center items-center mt-4">
                    <div className="flex flex-col items-center">
                        <div className="text-2xl">👤</div>
                        <div className="bg-math-blue p-2 rounded-lg mt-2">🍪🍪🍪</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-2xl">👤</div>
                        <div className="bg-math-blue p-2 rounded-lg mt-2">🍪🍪🍪</div>
                    </div>
                </div>
            )
        },
        power: {
            title: "Learning Powers",
            steps: [
                "Power means multiplying a number by itself!",
                "2^3 means 2 × 2 × 2.",
                "2 × 2 is 4, and 4 × 2 is 8. So 2^3 = 8!"
            ]
        },
        factorial: {
            title: "Learning Factorials",
            steps: [
                "Factorial (!) is multiplying down to 1!",
                "3! means 3 × 2 × 1.",
                "3 × 2 is 6, and 6 × 1 is 6. So 3! = 6!"
            ]
        },
        prime: {
            title: "Prime vs Composite",
            steps: [
                "A Prime number can only be divided by 1 and itself.",
                "Example: 5 is Prime. You can't make equal groups except 1 group of 5.",
                "Composite numbers can be broken into equal groups! Like 6 (2 groups of 3)."
            ]
        }
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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (status !== 'idle' || userInput.trim() === '') return

        const isCorrect = type === 'prime'
            ? userInput.toLowerCase() === (question.answer ? 'yes' : 'no')
            : parseInt(userInput) === question.answer

        if (isCorrect) {
            setStatus('correct')
            setScore(s => s + 1)
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#E3F2FD', '#E8F5E9', '#FFF9C4', '#F3E5F5']
            })

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-3xl mx-auto"
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="card p-8 text-center border-b-8 border-math-purple"
                    >
                        <h2 className="text-3xl font-black mb-8 text-soft-text">Game Setup</h2>

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

                        <button onClick={startPlay} className="btn-primary bg-math-purple-dark text-white w-full py-4 text-xl flex items-center justify-center gap-2">
                            Start Game! <PlayCircle />
                        </button>
                    </motion.div>
                ) : mode === 'learn' ? (
                    <motion.div
                        key="learn"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="card py-10 px-8 border-b-8 border-math-green"
                    >
                        <h2 className="text-4xl font-black mb-8 text-center text-soft-text">
                            {learnData[type]?.title || "Let's Learn!"}
                        </h2>

                        <div className="space-y-6 mb-10">
                            {learnData[type]?.steps.map((step, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.5 }}
                                    key={i}
                                    className="flex items-start gap-4 p-4 bg-math-blue/30 rounded-2xl border-2 border-math-blue/50"
                                >
                                    <div className="w-8 h-8 rounded-full bg-math-purple text-white flex items-center justify-center font-bold flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <p className="text-lg font-medium">{step}</p>
                                </motion.div>
                            ))}
                        </div>

                        {learnData[type]?.visual && (
                            <div className="mb-12 p-6 bg-white rounded-3xl shadow-inner border-2 border-dashed border-math-purple text-math-purple-dark font-black">
                                {learnData[type].visual}
                            </div>
                        )}

                        <button
                            onClick={() => setMode('setup')}
                            className="btn-primary bg-math-purple-dark text-white w-full py-4 text-xl flex items-center justify-center gap-2"
                        >
                            I'm Ready to Play! <ArrowRight />
                        </button>
                    </motion.div>
                ) : mode === 'results' ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="card p-10 text-center border-b-8 border-math-green-dark"
                    >
                        <Trophy size={80} className="mx-auto text-math-yellow-dark mb-6" />
                        <h2 className="text-4xl font-black mb-2 text-soft-text">Game Over!</h2>
                        <p className="text-xl text-soft-text/80 mb-8">Great effort on the {difficulty} level</p>

                        <div className="bg-math-blue/30 rounded-3xl p-8 mb-8">
                            <div className="text-6xl font-black text-math-purple-dark mb-2">{score} / {totalQuestions}</div>
                            <p className="text-lg font-bold text-soft-text">{Math.round((score / totalQuestions) * 100)}% Correct</p>
                        </div>

                        <div className="flex flex-col gap-4">
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
        </motion.div>
    )
}

export default MathGame
