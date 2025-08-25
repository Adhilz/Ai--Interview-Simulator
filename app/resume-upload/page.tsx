"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Brain,
  Zap,
  Ship as Skip,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function ResumeUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parseProgress, setParseProgress] = useState(0)
  const [parseComplete, setParseComplete] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const router = useRouter()

  // Mock parsed resume data
  const mockParsedData = {
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    phone: "+1 (555) 123-4567",
    experience: "5 years",
    skills: ["React", "TypeScript", "Node.js", "Python", "AWS"],
    education: "BS Computer Science, Stanford University",
    previousRoles: ["Senior Software Engineer at Meta", "Software Engineer at Google"],
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (selectedFile: File) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please upload a PDF or Word document")
      return
    }

    setFile(selectedFile)
    setIsUploading(true)

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsUploading(false)
    setIsParsing(true)

    // Simulate parsing with progress
    const parseInterval = setInterval(() => {
      setParseProgress((prev) => {
        if (prev >= 100) {
          clearInterval(parseInterval)
          setIsParsing(false)
          setParseComplete(true)
          setParsedData(mockParsedData)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const removeFile = () => {
    setFile(null)
    setParseProgress(0)
    setParseComplete(false)
    setParsedData(null)
  }

  const continueToSetup = () => {
    router.push("/interview-setup")
  }

  const skipUpload = () => {
    router.push("/interview-setup")
  }

  const goBack = () => {
    router.push("/dashboard")
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold font-heading">AI Interview Simulator</h1>
            </div>
            <Badge variant="outline" className="text-sm">
              Step 1 of 4
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-heading">Upload Your Resume</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Resume Upload</span>
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span>Interview Setup</span>
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span>AI Interview</span>
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span>Results</span>
            </div>
          </div>
          <Progress value={25} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume to get personalized interview questions based on your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer hover:border-primary/50 ${
                      dragActive ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold font-heading mb-2">Drop your resume here</h3>
                        <p className="text-muted-foreground mb-4">or click to browse files</p>
                        <Badge variant="secondary" className="text-xs">
                          PDF, DOC, DOCX up to 10MB
                        </Badge>
                      </div>
                    </div>
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileInput}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Info */}
                    <Card className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{file.name}</h4>
                              <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={removeFile}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upload Progress */}
                    {isUploading && (
                      <Card className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Upload className="h-4 w-4 text-primary animate-bounce" />
                            <span className="text-sm font-medium">Uploading...</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </CardContent>
                      </Card>
                    )}

                    {/* Parsing Progress */}
                    {isParsing && (
                      <Card className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Brain className="h-4 w-4 text-secondary animate-pulse" />
                            <span className="text-sm font-medium">Parsing resume with AI...</span>
                          </div>
                          <Progress value={parseProgress} className="h-2" />
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            <span>Extracting skills, experience, and education</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Parse Complete */}
                    {parseComplete && (
                      <Card className="border border-green-200 bg-green-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Resume parsed successfully!</span>
                          </div>
                          <p className="text-xs text-green-700">
                            We've extracted your key information to personalize your interview
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skip Option */}
            <Card className="glass border-dashed">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                    <Skip className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-heading mb-2">Don't have a resume?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You can still practice with general interview questions
                    </p>
                    <Button
                      variant="outline"
                      onClick={skipUpload}
                      className="hover:scale-105 transition-all bg-transparent"
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Brain className="h-5 w-5 text-secondary" />
                  AI Analysis Preview
                </CardTitle>
                <CardDescription>
                  {parsedData ? "Here's what we extracted from your resume" : "Upload a resume to see AI analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parsedData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
                        <p className="font-semibold">{parsedData.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Experience</h4>
                        <p className="font-semibold">{parsedData.experience}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Roles</h4>
                      <div className="space-y-1">
                        {parsedData.previousRoles.map((role: string, index: number) => (
                          <p key={index} className="text-sm">
                            • {role}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Personalization Ready</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your interview will include questions tailored to your {parsedData.experience} of experience and{" "}
                        {parsedData.skills.length} key skills.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Upload your resume to see AI analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={goBack} className="hover:scale-105 transition-all bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Button
            onClick={continueToSetup}
            disabled={isParsing || isUploading}
            className="hover:scale-105 transition-all duration-300 group"
            size="lg"
          >
            Continue to Setup
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}
