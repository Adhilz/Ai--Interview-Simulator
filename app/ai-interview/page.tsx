"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mic,
  MicOff,
  Send,
  Clock,
  Brain,
  Pause,
  Play,
  SkipForward,
  Volume2,
  VolumeX,
  MessageSquare,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Question {
  id: number
  text: string
  category: string
  timeLimit: number
}

interface Answer {
  questionId: number
  text: string
  audioBlob?: Blob
  timeSpent: number
}

export default function AIInterview() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes per question
  const [totalTime, setTotalTime] = useState(0)
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false)
  const [questionDisplayText, setQuestionDisplayText] = useState("")
  const [isQuestionComplete, setIsQuestionComplete] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")

  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const typewriterRef = useRef<NodeJS.Timeout | null>(null)

  // Mock interview questions
  const questions: Question[] = [
    {
      id: 1,
      text: "Tell me about yourself and your background in software development.",
      category: "Introduction",
      timeLimit: 120,
    },
    {
      id: 2,
      text: "Describe a challenging project you worked on and how you overcame the obstacles.",
      category: "Experience",
      timeLimit: 180,
    },
    {
      id: 3,
      text: "How do you stay updated with the latest technologies and industry trends?",
      category: "Learning",
      timeLimit: 120,
    },
    {
      id: 4,
      text: "Explain a time when you had to work with a difficult team member. How did you handle it?",
      category: "Teamwork",
      timeLimit: 150,
    },
    {
      id: 5,
      text: "Where do you see yourself in your career five years from now?",
      category: "Goals",
      timeLimit: 120,
    },
  ]

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  useEffect(() => {
    startQuestion()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (typewriterRef.current) clearTimeout(typewriterRef.current)
    }
  }, [currentQuestionIndex])

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleNextQuestion()
            return 0
          }
          return prev - 1
        })
        setTotalTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, timeRemaining])

  const startQuestion = () => {
    setIsAvatarSpeaking(true)
    setQuestionDisplayText("")
    setIsQuestionComplete(false)
    setTimeRemaining(currentQuestion.timeLimit)

    // Simulate avatar speaking
    setTimeout(() => {
      setIsAvatarSpeaking(false)
      startTypewriter()
    }, 2000)
  }

  const startTypewriter = () => {
    const text = currentQuestion.text
    let i = 0

    const typeChar = () => {
      if (i < text.length) {
        setQuestionDisplayText(text.slice(0, i + 1))
        i++
        typewriterRef.current = setTimeout(typeChar, 50)
      } else {
        setIsQuestionComplete(true)
      }
    }

    typeChar()
  }

  const handleAnswerSubmit = () => {
    const answer: Answer = {
      questionId: currentQuestion.id,
      text: currentAnswer,
      timeSpent: currentQuestion.timeLimit - timeRemaining,
    }

    setAnswers((prev) => [...prev, answer])
    setCurrentAnswer("")
    handleNextQuestion()
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Interview complete
      router.push("/feedback-results")
    }
  }

  const handleSkipQuestion = () => {
    const answer: Answer = {
      questionId: currentQuestion.id,
      text: "Skipped",
      timeSpent: currentQuestion.timeLimit - timeRemaining,
    }

    setAnswers((prev) => [...prev, answer])
    handleNextQuestion()
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    setInputMode(isRecording ? "text" : "voice")
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeColor = () => {
    if (timeRemaining <= 30) return "text-red-600"
    if (timeRemaining <= 60) return "text-yellow-600"
    return "text-foreground"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full animate-float" />
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold font-heading">AI Interview Simulator</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Step 3 of 4
              </Badge>
              <Button variant="ghost" size="sm" onClick={togglePause}>
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-heading">AI Interview Session</h2>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length} • {currentQuestion.category}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-2xl font-bold font-heading ${getTimeColor()}`}>{formatTime(timeRemaining)}</div>
                <div className="text-sm text-muted-foreground">Time remaining</div>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Interviewer Section */}
          <div className="space-y-6">
            {/* AI Avatar */}
            <Card className="glass">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32 mx-auto ring-4 ring-primary/20">
                      <AvatarImage src="/ai-interviewer-avatar.png" />
                      <AvatarFallback className="text-2xl font-bold bg-primary/10">AI</AvatarFallback>
                    </Avatar>

                    {/* Speaking indicator */}
                    {isAvatarSpeaking && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-1 bg-primary/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <Volume2 className="h-3 w-3 text-primary" />
                          <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 h-3 bg-primary rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 200}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-heading">Alex Chen</h3>
                    <p className="text-muted-foreground">Senior Technical Interviewer</p>
                    <Badge variant="secondary" className="mt-2">
                      <Brain className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Panel */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                  Interview Question
                </CardTitle>
                <CardDescription>
                  Category: {currentQuestion.category} • Time limit: {formatTime(currentQuestion.timeLimit)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[120px] flex items-center">
                  <p className="text-lg leading-relaxed">
                    {questionDisplayText}
                    {!isQuestionComplete && <span className="animate-pulse text-primary">|</span>}
                  </p>
                </div>

                {isQuestionComplete && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Question ready for your response</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Controls */}
            <Card className="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAudioEnabled(!audioEnabled)}>
                      {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      Audio
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      {inputMode === "voice" ? "Voice Input" : "Text Input"}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkipQuestion}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Skip Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Answer Section */}
          <div className="space-y-6">
            {/* Answer Input */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Mic className="h-5 w-5 text-accent" />
                  Your Response
                </CardTitle>
                <CardDescription>
                  {inputMode === "voice"
                    ? "Click the microphone to record your answer"
                    : "Type your answer in the text area below"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {inputMode === "text" ? (
                  <Textarea
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="min-h-[200px] resize-none"
                    disabled={isPaused}
                  />
                ) : (
                  <div className="min-h-[200px] border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div
                        className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isRecording ? "bg-red-500/20 animate-pulse" : "bg-primary/10 hover:bg-primary/20"
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={toggleRecording}
                          className="w-full h-full rounded-full"
                          disabled={isPaused}
                        >
                          {isRecording ? (
                            <MicOff className="h-8 w-8 text-red-500" />
                          ) : (
                            <Mic className="h-8 w-8 text-primary" />
                          )}
                        </Button>
                      </div>
                      <div>
                        <p className="font-semibold">{isRecording ? "Recording..." : "Click to start recording"}</p>
                        <p className="text-sm text-muted-foreground">
                          {isRecording ? "Click again to stop" : "Speak clearly into your microphone"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMode(inputMode === "text" ? "voice" : "text")}
                    >
                      {inputMode === "text" ? (
                        <>
                          <Mic className="h-4 w-4 mr-1" />
                          Switch to Voice
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Switch to Text
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={(!currentAnswer.trim() && !isRecording) || isPaused}
                    className="hover:scale-105 transition-all duration-300 group"
                  >
                    <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    Submit Answer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Clock className="h-5 w-5 text-primary" />
                  Session Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-heading text-primary">{currentQuestionIndex + 1}</div>
                    <div className="text-sm text-muted-foreground">Current Question</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-heading text-secondary">{formatTime(totalTime)}</div>
                    <div className="text-sm text-muted-foreground">Total Time</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Interview Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Questions Completed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {questions.map((_, index) => (
                      <Badge
                        key={index}
                        variant={
                          index < currentQuestionIndex
                            ? "default"
                            : index === currentQuestionIndex
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {index + 1}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
