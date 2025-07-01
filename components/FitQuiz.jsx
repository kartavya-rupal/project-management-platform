"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ArrowRight, ArrowLeft, Users, Target, Clock, Zap, Trophy, Loader2 } from "lucide-react"

const questions = [
    {
        id: 1,
        question: "What's your team size?",
        icon: Users,
        options: [
            { value: "small", label: "1-5 people", points: 3 },
            { value: "medium", label: "6-20 people", points: 5 },
            { value: "large", label: "21-50 people", points: 4 },
            { value: "enterprise", label: "50+ people", points: 5 },
        ],
    },
    {
        id: 2,
        question: "What's your primary workflow style?",
        icon: Target,
        options: [
            { value: "agile", label: "Agile/Scrum", points: 5 },
            { value: "kanban", label: "Kanban", points: 5 },
            { value: "waterfall", label: "Traditional/Waterfall", points: 3 },
            { value: "hybrid", label: "Mix of different methods", points: 4 },
        ],
    },
    {
        id: 3,
        question: "How important is real-time collaboration?",
        icon: Zap,
        options: [
            { value: "critical", label: "Critical - We work together constantly", points: 5 },
            { value: "important", label: "Important - Regular collaboration", points: 4 },
            { value: "moderate", label: "Moderate - Occasional collaboration", points: 3 },
            { value: "minimal", label: "Minimal - Mostly independent work", points: 2 },
        ],
    },
    {
        id: 4,
        question: "What's your biggest project management challenge?",
        icon: Clock,
        options: [
            { value: "tracking", label: "Tracking progress and deadlines", points: 5 },
            { value: "communication", label: "Team communication", points: 4 },
            { value: "organization", label: "Keeping tasks organized", points: 5 },
            { value: "reporting", label: "Generating reports and insights", points: 4 },
        ],
    },
    {
        id: 5,
        question: "How tech-savvy is your team?",
        icon: Trophy,
        options: [
            { value: "expert", label: "Very tech-savvy", points: 5 },
            { value: "comfortable", label: "Comfortable with new tools", points: 4 },
            { value: "basic", label: "Basic tech skills", points: 3 },
            { value: "minimal", label: "Prefer simple, intuitive tools", points: 4 },
        ],
    },
]

const FitQuiz = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState({})
    const [showResult, setShowResult] = useState(false)
    const [selectedOption, setSelectedOption] = useState(null)
    const [loading, setLoading] = useState(false)


    const handleAnswer = (questionId, option) => {
        setSelectedOption(option.value)
        setAnswers({ ...answers, [questionId]: option })
    }

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setSelectedOption(answers[questions[currentQuestion + 1].id]?.value || null)
        } else {
            setLoading(true)
            setTimeout(() => {
                setLoading(false)
                setShowResult(true)
            }, 1500)
        }
    }


    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
            setSelectedOption(answers[questions[currentQuestion - 1].id]?.value || null)
        }
    }

    const calculateScore = () => {
        return Object.values(answers).reduce((total, answer) => total + answer.points, 0)
    }

    const getResultMessage = (score) => {
        if (score >= 20) {
            return {
                title: "Perfect Fit! 🎉",
                message:
                    "Workly is an excellent match for your team. You'll love our advanced features and collaborative tools.",
                color: "text-green-600",
                bgColor: "bg-green-500/10",
                borderColor: "border-green-200",
            }
        } else if (score >= 15) {
            return {
                title: "Great Match! ✨",
                message: "Workly aligns well with your needs. Our platform will help streamline your workflow significantly.",
                color: "text-blue-600",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-200",
            }
        } else {
            return {
                title: "Good Potential! 💡",
                message: "Workly can still benefit your team. Our intuitive design makes it easy to adopt new workflows.",
                color: "text-orange-600",
                bgColor: "bg-orange-500/10",
                borderColor: "border-orange-200",
            }
        }
    }

    const resetQuiz = () => {
        setCurrentQuestion(0)
        setAnswers({})
        setShowResult(false)
        setSelectedOption(null)
    }

    const progress = ((currentQuestion) / questions.length) * 100

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent animate-pulse"></div>
                    <CardContent className="relative z-10 p-12 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <p className="text-lg text-primary/80 font-medium">Calculating your perfect match...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }


    if (showResult) {
        const score = calculateScore()
        const result = getResultMessage(score)

        return (
            <div className="max-w-2xl mx-auto">
                <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                    <CardContent className="relative z-10 p-8 text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${result.bgColor} mb-6`}>
                            <CheckCircle className={`h-8 w-8 ${result.color}`} />
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 ${result.color}`}>{result.title}</h3>
                        <p className="text-primary/80 mb-6 leading-relaxed">{result.message}</p>
                        <div className={`p-4 rounded-lg ${result.bgColor} border ${result.borderColor} mb-6`}>
                            <p className="text-sm font-medium">Your compatibility score: {score}/25</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={resetQuiz}
                                variant="outline"
                                className="cursor-pointer bg-background/50 border-primary/30 hover:bg-primary/10"
                            >
                                Take Quiz Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const question = questions[currentQuestion]
    const IconComponent = question.icon

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <CardContent className="relative z-10 p-8">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-primary/70">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                            <span className="text-sm text-primary/70">{Math.round(progress)}% Complete</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Question */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                            <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            {question.question}
                        </h3>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-8">
                        {question.options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(question.id, option)}
                                className={`w-full p-4 text-left rounded-lg border transition-all duration-200 cursor-pointer ${selectedOption === option.value
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-primary/20 bg-background/50 hover:border-primary/40 hover:bg-primary/5"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{option.label}</span>
                                    {selectedOption === option.value && <CheckCircle className="h-5 w-5 text-primary" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            variant="outline"
                            className="cursor-pointer bg-background/50 border-primary/30 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={!selectedOption}
                            className="cursor-pointer bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentQuestion === questions.length - 1 ? "See Results" : "Next"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default FitQuiz
