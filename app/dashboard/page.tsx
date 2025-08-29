"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Calendar, TrendingUp, Star, Play, BarChart3, Clock, Target, Award, User, Mail } from "lucide-react";
import MainNav from "@/components/main-nav";

export default function Dashboard() {
  const [isVisible, setIsVisible] = useState({})

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

  // Mock user data
  const user = {
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatar: "/professional-woman-software-engineer.jpg",
    joinDate: "March 2024",
  }

  // Mock interview history
  const interviewHistory = [
    {
      id: 1,
      date: "2024-01-15",
      role: "Software Engineer",
      company: "Google",
      score: 92,
      feedback: "Excellent technical knowledge and communication skills",
      duration: "45 min",
      status: "completed",
    },
    {
      id: 2,
      date: "2024-01-10",
      role: "Frontend Developer",
      company: "Meta",
      score: 88,
      feedback: "Strong problem-solving approach, work on system design",
      duration: "40 min",
      status: "completed",
    },
    {
      id: 3,
      date: "2024-01-05",
      role: "Full Stack Developer",
      company: "Netflix",
      score: 85,
      feedback: "Good coding skills, improve behavioral responses",
      duration: "50 min",
      status: "completed",
    },
    {
      id: 4,
      date: "2024-01-02",
      role: "React Developer",
      company: "Airbnb",
      score: 79,
      feedback: "Solid foundation, focus on advanced React patterns",
      duration: "35 min",
      status: "completed",
    },
  ]

  // Calculate stats
  const totalInterviews = interviewHistory.length
  const bestScore = Math.max(...interviewHistory.map((interview) => interview.score))
  const averageScore = Math.round(
    interviewHistory.reduce((sum, interview) => sum + interview.score, 0) / totalInterviews,
  )

  const stats = [
    {
      label: "Total Interviews",
      value: totalInterviews,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Best Score",
      value: `${bestScore}%`,
      icon: Award,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Average Rating",
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-orange-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 80) return "secondary"
    return "outline"
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block w-64 bg-muted/30 border-r border-border">
        <MainNav />
      </aside>
      <main className="flex-1">
        {/* ...existing dashboard content (welcome, stats, history, etc.)... */}
        {/* Floating Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full animate-float" />
          <div
            className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-40 left-1/4 w-40 h-40 bg-accent/10 rounded-full animate-float"
            style={{ animationDelay: "4s" }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-heading text-foreground mb-2">
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h2>
            <p className="text-muted-foreground">Ready to practice your next interview?</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Profile & Stats */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <Card id="profile" className="glass hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <Avatar className="h-20 w-20 mx-auto mb-4 ring-4 ring-primary/20">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg font-semibold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-heading">{user.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </CardDescription>
                  <Badge variant="outline" className="w-fit mx-auto mt-2">
                    <User className="h-3 w-3 mr-1" />
                    Member since {user.joinDate}
                  </Badge>
                </CardHeader>
              </Card>
              {/* Quick Stats */}
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <Card
                    key={stat.label}
                    className={`glass hover:scale-105 transition-all duration-300 ${
                      isVisible.profile ? "animate-in slide-in-from-left duration-700" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold font-heading">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Start Interview CTA */}
              <Card className="glass p-6 text-center hover:scale-105 transition-all duration-300">
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">Ready for your next interview?</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Practice with our AI interviewer and get instant feedback
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="w-full animate-pulse-glow hover:scale-105 transition-all duration-300 group"
                  >
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Start Mock Interview
                  </Button>
                </CardContent>
              </Card>
            </div>
            {/* Right Column - Interview History */}
            <div className="lg:col-span-2">
              <Card className="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 font-heading">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Interview History
                      </CardTitle>
                      <CardDescription>Your recent practice sessions and performance</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {totalInterviews} Total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interviewHistory.map((interview, index) => (
                    <Card
                      key={interview.id}
                      className="hover:scale-[1.02] transition-all duration-300 border border-border/50 hover:border-primary/30"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Brain className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold font-heading">{interview.role}</h4>
                              <p className="text-sm text-muted-foreground">{interview.company}</p>
                            </div>
                          </div>
                          <Badge variant={getScoreBadgeVariant(interview.score)} className="text-sm">
                            <Star className="h-3 w-3 mr-1" />
                            {interview.score}%
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Performance</span>
                            <span className={`font-medium ${getScoreColor(interview.score)}`}>{interview.score}%</span>
                          </div>
                          <Progress value={interview.score} className="h-2" />
                        </div>
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground italic">"{interview.feedback}"</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(interview.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {interview.duration}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {/* View All Button */}
                  <div className="text-center pt-4">
                    <Button variant="outline" className="hover:scale-105 transition-all duration-300 bg-transparent">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
