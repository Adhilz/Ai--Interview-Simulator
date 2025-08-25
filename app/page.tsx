"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Brain,
  FileText,
  MessageSquare,
  BarChart3,
  Volume2,
  User,
  Star,
  ArrowRight,
  Play,
  Upload,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  Mail,
  HelpCircle,
} from "lucide-react"

export default function LandingPage() {
  const [typewriterText, setTypewriterText] = useState("")
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})

  const fullText = "Your AI-Powered Interview Partner"

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypewriterText(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(testimonialTimer)
  }, [])

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

    const [soundHeights, setSoundHeights] = useState<number[]>([]);

    // Generate random heights for sound animation only on client
    useEffect(() => {
      setSoundHeights(Array.from({ length: 4 }, () => Math.random() * 20 + 10));
    }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Generated Questions",
      description: "Dynamic interview questions tailored to your role and experience level",
      animation: "typewriter",
    },
    {
      icon: FileText,
      title: "Resume Parsing & Smart Questioning",
      description: "Upload your resume and get personalized questions based on your background",
      animation: "upload",
    },
    {
      icon: MessageSquare,
      title: "Answer Evaluation & Feedback",
      description: "Real-time analysis of your responses with actionable improvement suggestions",
      animation: "progress",
    },
    {
      icon: User,
      title: "AI Avatar with Lip-Sync",
      description: "Practice with a realistic AI interviewer that responds naturally",
      animation: "avatar",
    },
    {
      icon: Volume2,
      title: "Text-to-Speech (TTS)",
      description: "Hear questions spoken naturally with advanced voice synthesis",
      animation: "sound",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track your progress with detailed insights and improvement metrics",
      animation: "chart",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Google",
      image: "/professional-woman-software-engineer.jpg",
      content:
        "This AI simulator helped me land my dream job at Google. The feedback was incredibly detailed and actionable.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      company: "Microsoft",
      image: "/professional-product-manager.jpg",
      content: "The AI avatar felt so realistic, it was like practicing with a real interviewer. Highly recommend!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist",
      company: "Netflix",
      image: "/professional-woman-data-scientist.jpg",
      content:
        "The personalized questions based on my resume were spot-on. It prepared me for exactly what I faced in real interviews.",
      rating: 5,
    },
  ]

  const stats = [
    { label: "Success Rate", value: 94, color: "bg-primary" },
    { label: "User Satisfaction", value: 98, color: "bg-secondary" },
    { label: "Interview Confidence", value: 89, color: "bg-accent" },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
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
        <div
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-accent/10 rounded-full animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-heading text-foreground">
              <span className="inline-block min-h-[1.2em]">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Master your interviews with AI-powered practice sessions, real-time feedback, and personalized coaching
              that adapts to your unique profile.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 animate-pulse-glow hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-xl hover:shadow-primary/25"
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Try a Mock Interview
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("features")}
                className="text-base px-6 py-4 glass hover:scale-105 transition-all duration-300 bg-transparent hover:bg-primary/5 group"
              >
                <Target className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                Explore Features
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("how-it-works")}
                className="text-base px-6 py-4 glass hover:scale-105 transition-all duration-300 bg-transparent hover:bg-secondary/5 group"
              >
                <Brain className="mr-2 h-4 w-4 group-hover:pulse transition-all" />
                How It Works
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-base px-6 py-4 glass hover:scale-105 transition-all duration-300 bg-transparent hover:bg-accent/5 group hover:animate-bounce"
              >
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Take a Sample Test
              </Button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-8 pt-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold font-heading text-foreground">{stat.value}%</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-2">
              <Zap className="mr-2 h-4 w-4" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold font-heading text-foreground mb-4">
              Everything You Need to Ace Your Interview
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive AI platform provides personalized interview preparation with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className={`glass hover:scale-105 transition-all duration-500 hover:shadow-2xl group cursor-pointer ${
                  isVisible.features ? "animate-in slide-in-from-bottom-8 duration-700" : "opacity-0"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl font-heading group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>

                  {/* Feature-specific animations */}
                  <div className="mt-6 flex justify-center">
                    {feature.animation === "progress" && (
                      <div className="w-full space-y-2">
                        <Progress value={85} className="h-2" />
                        <div className="text-xs text-center text-muted-foreground">Answer Quality: 85%</div>
                      </div>
                    )}
                    {feature.animation === "upload" && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4 animate-bounce" />
                        <span>Drop your resume here</span>
                      </div>
                    )}
                    {feature.animation === "sound" && (
                      <div className="flex items-center gap-1">
                        {soundHeights.length === 4
                          ? soundHeights.map((height, i) => (
                              <div
                                key={i}
                                className="w-1 bg-primary rounded-full animate-pulse"
                                style={{
                                  height: `${height}px`,
                                  animationDelay: `${i * 200}ms`,
                                }}
                              />
                            ))
                          : null}
                      </div>
                    )}
                    {feature.animation === "chart" && (
                      <div className="flex items-end gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-3 bg-primary rounded-t animate-pulse"
                            style={{
                              height: `${(i + 1) * 8}px`,
                              animationDelay: `${i * 300}ms`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-2">
            <Brain className="mr-2 h-4 w-4" />
            Simple 3-Step Process
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold font-heading text-foreground mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground mb-12">Get started with your AI interview practice in minutes</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload Resume", desc: "Share your background for personalized questions" },
              { step: "2", title: "Practice Interview", desc: "Engage with our AI interviewer in real-time" },
              { step: "3", title: "Get Feedback", desc: "Receive detailed analysis and improvement tips" },
            ].map((item, index) => (
              <Card key={item.step} className="glass p-6 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-primary mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-sm px-4 py-2">
              <Star className="mr-2 h-4 w-4 fill-current" />
              Trusted by Professionals
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold font-heading text-foreground mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands who've landed their dream jobs with our AI interview simulator
            </p>
          </div>

          <div className="relative">
            <Card className="glass min-h-[300px] flex items-center">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                    <AvatarImage src={testimonials[currentTestimonial].image || "/placeholder.svg"} />
                    <AvatarFallback>{testimonials[currentTestimonial].name[0]}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                <blockquote className="text-lg sm:text-xl text-foreground mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div>
                  <div className="font-semibold font-heading text-lg">{testimonials[currentTestimonial].name}</div>
                  <div className="text-muted-foreground">
                    {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? "bg-primary scale-125" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass p-12 hover:scale-105 transition-all duration-500">
            <CardContent className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-5xl font-bold font-heading text-foreground mb-4">
                  Ready to Ace Your Next Interview?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join over 50,000 professionals who've improved their interview skills with our AI platform
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-12 py-6 animate-pulse-glow hover:scale-105 transition-all duration-300 group"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-12 py-6 hover:scale-105 transition-all duration-300 bg-transparent"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Pricing
                </Button>
              </div>

              <div className="flex justify-center items-center gap-6 pt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>7-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-primary transition-all duration-300 group hover:underline"
            >
              <a href="mailto:adhilsalam200@gmail.com" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Need Help?
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-heading text-foreground">AI Interview Simulator</h3>
              <p className="text-muted-foreground">Your AI-powered partner for interview success.</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:adhilsalam200@gmail.com"
                  className="hover:text-primary transition-colors hover:underline"
                >
                  adhilsalam200@gmail.com
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    onClick={() => scrollToSection("features")}
                    className="hover:text-primary transition-colors hover:underline cursor-pointer"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover:underline">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover:underline">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover:underline">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover:underline">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover:underline">
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:adhilsalam200@gmail.com"
                    className="hover:text-primary transition-colors hover:underline"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover:underline">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 AI Interview Simulator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
