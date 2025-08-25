"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Star,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Home,
  Download,
  Share2,
  Target,
  MessageSquare,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BarChart3,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

export default function FeedbackResults() {
  const [isVisible, setIsVisible] = useState({})
  const [animatedScore, setAnimatedScore] = useState(0)
  const router = useRouter()

  const finalScore = 87 // Mock overall score

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }))
        })
      },
      { threshold: 0.1 },
    )

    document.querySelectorAll("[id]").forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Animate the main score
    let start = 0
    const increment = finalScore / 100
    const timer = setInterval(() => {
      start += increment
      if (start >= finalScore) {
        setAnimatedScore(finalScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(start))
      }
    }, 20)

    return () => clearInterval(timer)
  }, [])

  // Mock feedback data
  const categoryScores = [
    { category: "Communication", score: 92, color: "#0891b2" },
    { category: "Technical Knowledge", score: 85, color: "#6366f1" },
    { category: "Problem Solving", score: 88, color: "#ec4899" },
    { category: "Confidence", score: 84, color: "#10b981" },
    { category: "Clarity", score: 90, color: "#f59e0b" },
  ]

  const questionPerformance = [
    { question: "Q1", score: 95, category: "Introduction" },
    { question: "Q2", score: 82, category: "Experience" },
    { question: "Q3", score: 88, category: "Learning" },
    { question: "Q4", score: 85, category: "Teamwork" },
    { question: "Q5", score: 85, category: "Goals" },
  ]

  const timeAnalysis = [
    { category: "Avg Response Time", value: "45s", status: "good" },
    { category: "Total Interview Time", value: "12m 30s", status: "excellent" },
    { category: "Thinking Pauses", value: "3.2s avg", status: "good" },
  ]

  const strengths = [
    "Excellent communication skills and clear articulation",
    "Strong technical knowledge with specific examples",
    "Confident delivery and professional demeanor",
    "Good use of the STAR method in behavioral questions",
  ]

  const improvements = [
    "Consider providing more quantifiable achievements",
    "Work on reducing filler words during responses",
    "Expand on leadership experience with concrete examples",
    "Practice concise answers for time management",
  ]

  const badges = [
    { name: "Clear Communicator", icon: MessageSquare, earned: true },
    { name: "Technical Expert", icon: Brain, earned: true },
    { name: "Problem Solver", icon: Target, earned: true },
    { name: "Time Manager", icon: Clock, earned: false },
    { name: "Confident Speaker", icon: Award, earned: true },
  ]

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  }

  const retryInterview = () => {
    router.push("/resume-upload")
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-green-500 to-green-600"
    if (score >= 80) return "from-blue-500 to-blue-600"
    if (score >= 70) return "from-yellow-500 to-yellow-600"
    return "from-red-500 to-red-600"
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
            <Badge variant="outline" className="text-sm">
              Step 4 of 4 - Complete
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading mb-2">Interview Complete!</h2>
          <p className="text-muted-foreground">Here's your detailed performance analysis and feedback</p>
        </div>

        {/* Overall Score Section */}
        <div className="mb-8">
          <Card id="score" className="glass text-center p-8 hover:scale-105 transition-all duration-500">
            <CardContent className="space-y-6">
              <div className="relative">
                <div className="mx-auto w-48 h-48 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - animatedScore / 100)}`}
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-5xl font-bold font-heading ${getScoreColor(animatedScore)}`}>
                        {animatedScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold font-heading mb-2">Excellent Performance!</h3>
                <p className="text-muted-foreground">
                  You scored in the top 15% of candidates. Your communication skills and technical knowledge really
                  stood out.
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Badge variant="default" className="text-sm px-4 py-2">
                  <Star className="h-4 w-4 mr-1" />
                  Top 15%
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  <Award className="h-4 w-4 mr-1" />
                  Interview Ready
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance Breakdown
              </CardTitle>
              <CardDescription>Your scores across different interview categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Question Performance */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Target className="h-5 w-5 text-secondary" />
                Question-by-Question Analysis
              </CardTitle>
              <CardDescription>How you performed on each interview question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questionPerformance.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">{item.question}</span>
                      <span className="text-sm text-muted-foreground ml-2">({item.category})</span>
                    </div>
                    <Badge variant={item.score >= 90 ? "default" : item.score >= 80 ? "secondary" : "outline"}>
                      {item.score}%
                    </Badge>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Strengths */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-green-600">
                <TrendingUp className="h-5 w-5" />
                Key Strengths
              </CardTitle>
              <CardDescription>What you did exceptionally well</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-yellow-600">
                <TrendingDown className="h-5 w-5" />
                Areas to Improve
              </CardTitle>
              <CardDescription>Opportunities for growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Time Analysis */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-blue-600">
                <Clock className="h-5 w-5" />
                Time Analysis
              </CardTitle>
              <CardDescription>Your timing and pacing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeAnalysis.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{item.value}</span>
                    {item.status === "excellent" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : item.status === "good" ? (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <Card className="glass mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Award className="h-5 w-5 text-accent" />
              Achievement Badges
            </CardTitle>
            <CardDescription>Skills and qualities you demonstrated during the interview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`text-center p-4 rounded-lg border transition-all duration-300 ${
                    badge.earned
                      ? "bg-primary/5 border-primary/20 hover:scale-105"
                      : "bg-muted/20 border-muted opacity-50"
                  }`}
                >
                  <div
                    className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      badge.earned ? "bg-primary/10" : "bg-muted/20"
                    }`}
                  >
                    <badge.icon className={`h-6 w-6 ${badge.earned ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                  <Badge variant={badge.earned ? "default" : "outline"} className="text-xs">
                    {badge.earned ? "Earned" : "Not Earned"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={retryInterview}
            variant="outline"
            size="lg"
            className="hover:scale-105 transition-all duration-300 bg-transparent"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Retry Interview
          </Button>

          <Button
            onClick={goToDashboard}
            size="lg"
            className="hover:scale-105 transition-all duration-300 group animate-pulse-glow"
          >
            <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Back to Dashboard
          </Button>

          <Button variant="outline" size="lg" className="hover:scale-105 transition-all duration-300 bg-transparent">
            <Download className="mr-2 h-5 w-5" />
            Download Report
          </Button>

          <Button variant="outline" size="lg" className="hover:scale-105 transition-all duration-300 bg-transparent">
            <Share2 className="mr-2 h-5 w-5" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  )
}
