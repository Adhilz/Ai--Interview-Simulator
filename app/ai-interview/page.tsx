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
  // Require user interaction before starting interview (for TTS autoplay)
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState("")
  // Chat/message history: { role: 'user' | 'ai', text: string }
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([])
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

  // Dynamic interview questions from LLM
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Helper: Play TTS audio for a question
  const playTTS = async (text: string) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
    } catch (err) {
      console.error("TTS error", err);
    }
  };

  // Fetch the first question from Gemini LLM only after interview is started
  useEffect(() => {
    if (!interviewStarted || questions.length > 0) return;
    setLoadingQuestion(true);
    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "You are an AI interviewer. Start the interview with a verbal, open-ended question. Respond to the candidate as a real interviewer would: give feedback, ask follow-ups, or move to the next topic. Do not just ask questions, but conduct a realistic interview. Only return the question or statement text.",
        history: []
      })
    })
      .then(res => res.json())
      .then(async data => {
        setQuestions([{ id: 1, text: data.text, category: "General", timeLimit: 120 }]);
        setLoadingQuestion(false);
        await playTTS(data.text);
        startQuestion();
      });
  }, [interviewStarted, questions.length]);


  useEffect(() => {
    if (!interviewStarted || questions.length === 0 || !currentQuestion) return;
    // Only start typewriter effect (not TTS) on question change
    startQuestion();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
    };
  }, [interviewStarted, currentQuestionIndex, questions.length]);

  useEffect(() => {
    if (!isPaused && timeRemaining > 0 && currentQuestion) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
        setTotalTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, timeRemaining, currentQuestion]);


  const startQuestion = () => {
    setIsAvatarSpeaking(true);
    setQuestionDisplayText("");
    setIsQuestionComplete(false);
    setTimeRemaining(currentQuestion?.timeLimit || 120);
    // Simulate avatar speaking
    setTimeout(() => {
      setIsAvatarSpeaking(false);
      startTypewriter();
    }, 2000);
  };


  const startTypewriter = () => {
    const text = currentQuestion?.text || "";
    let i = 0;
    const typeChar = () => {
      if (i < text.length) {
        setQuestionDisplayText(text.slice(0, i + 1));
        i++;
        typewriterRef.current = setTimeout(typeChar, 50);
      } else {
        setIsQuestionComplete(true);
      }
    };
    typeChar();
  };



  // --- STT Integration ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start/stop recording and transcribe (toggle style)
  const recordAndTranscribe = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        alert("Your browser does not support audio recording.");
        resolve("");
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const res = await fetch('/api/stt', {
              method: 'POST',
              headers: { 'Content-Type': 'audio/webm' },
              body: audioBlob,
            });
            if (res.ok) {
              const data = await res.json();
              resolve(data.transcript || "");
            } else {
              resolve("");
            }
          };
          mediaRecorder.start();
          setIsRecording(true);
        })
        .catch(() => {
          alert("Could not access microphone.");
          resolve("");
        });
    });
  };

  // Toggle mic: start/stop recording, and on stop, transcribe and send
  const handleMicToggle = async () => {
    if (!isRecording) {
      // Start recording
      await recordAndTranscribe(); // This will set isRecording true
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        // Wait for onstop to resolve transcript and then send
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const res = await fetch('/api/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'audio/webm' },
            body: audioBlob,
          });
          let transcript = "";
          if (res.ok) {
            const data = await res.json();
            transcript = data.transcript || "";
          }
          setMessages((prev) => [...prev, { role: 'user', text: transcript }]);
          await handleAnswerSubmit(transcript);
        };
      }
    }
  };

  // Submit answer and fetch next question from LLM (limit to 5 questions, wait for user response)
  // Accepts optional answerText (for STT), otherwise uses currentAnswer (for text)
  const handleAnswerSubmit = async (answerOverride?: string) => {
    if (!currentQuestion) return;
    let answerText = answerOverride !== undefined ? answerOverride : currentAnswer;
    if (!answerText.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: answerText }]);
    const answer: Answer = {
      questionId: currentQuestion.id,
      text: answerText,
      timeSpent: currentQuestion.timeLimit - timeRemaining,
    };
    setAnswers((prev) => [...prev, answer]);
    setCurrentAnswer("");

    // Limit to 5 questions
    if (questions.length >= 5) {
      router.push("/feedback-results");
      return;
    }

    // Prepare conversation history for LLM
    const history = [
      ...questions.slice(0, currentQuestionIndex + 1).map((q, i) => ({
        role: "user",
        parts: [{ text: answers[i]?.text || "" }],
      })),
      { role: "user", parts: [{ text: answerText }] },
    ];

    setLoadingQuestion(true);
    // Ask LLM for next interviewer response (not just a question)
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "You are an AI interviewer. Respond to the candidate as a real interviewer would: give feedback, ask follow-ups, or move to the next topic. Do not just ask questions, but conduct a realistic interview. Only return the question or statement text.",
        history,
      }),
    });
    const data = await res.json();
    if (data.text) {
      setMessages((prev) => [...prev, { role: 'ai', text: data.text }]);
      setQuestions((prev) => [
        ...prev,
        { id: prev.length + 1, text: data.text, category: "General", timeLimit: 120 },
      ]);
      setCurrentQuestionIndex((prev) => prev + 1);
      await playTTS(data.text);
      startQuestion();
    } else {
      // Interview complete or error
      router.push("/feedback-results");
    }
    setLoadingQuestion(false);
  };


  // For skip, just fetch a new question (limit to 5 questions)
  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Limit to 5 questions
      if (questions.length >= 5) {
        router.push("/feedback-results");
        return;
      }
      // Ask LLM for next question
      setLoadingQuestion(true);
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Ask me the next software engineering interview question. Only return the question text.",
          history: [],
        }),
      });
      const data = await res.json();
      if (data.text) {
        setQuestions((prev) => [
          ...prev,
          { id: prev.length + 1, text: data.text, category: "General", timeLimit: 120 },
        ]);
        setCurrentQuestionIndex((prev) => prev + 1);
        // TTS integration: Play the question using TTS
        // await playTTS(data.text);
      } else {
        router.push("/feedback-results");
      }
      setLoadingQuestion(false);
    }
  };


  const handleSkipQuestion = () => {
    if (!currentQuestion) return;
    const answer: Answer = {
      questionId: currentQuestion.id,
      text: "Skipped",
      timeSpent: currentQuestion.timeLimit - timeRemaining,
    };
    setAnswers((prev) => [...prev, answer]);
    handleNextQuestion();
  };

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
    if (timeRemaining <= 30) return "text-red-600";
    if (timeRemaining <= 60) return "text-yellow-600";
    return "text-foreground";
  };


  // getAIResponse is now handled inline in submit/next logic


  if (!interviewStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-3xl font-bold mb-2">AI Interview Simulator</h1>
          <p className="text-lg text-muted-foreground mb-4">Click below to begin your interview. Audio will play aloud.</p>
          <button
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-xl font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setInterviewStarted(true)}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {loadingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="p-8 bg-white rounded-lg shadow-lg text-lg font-semibold">Loading next question...</div>
        </div>
      )}
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
                Question {currentQuestionIndex + 1} of {questions.length}
                {currentQuestion && currentQuestion.category ? ` • ${currentQuestion.category}` : ""}
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
          {/* AI Interviewer Section (Zoom-like) */}
          <div className="space-y-6 flex flex-col items-center justify-center">
            {/* AI Avatar */}
            <Card className="glass w-fit mx-auto">
              <CardContent className="p-6 flex flex-col items-center">
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
                <div className="mt-4">
                  <h3 className="text-xl font-bold font-heading">Alex Chen</h3>
                  <p className="text-muted-foreground">Senior Technical Interviewer</p>
                  <Badge variant="secondary" className="mt-2">
                    <Brain className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
              </CardContent>
            </Card>
            {/* Subtitle-style question display */}
            {/* Chat/message history */}
            <div className="max-h-40 overflow-y-auto flex flex-col gap-2 mb-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`text-left ${msg.role === 'user' ? 'justify-end flex-row-reverse' : ''} flex items-center gap-2`}>
                  <span className={`px-3 py-2 rounded-lg text-base shadow ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>{msg.text}</span>
                  {msg.role === 'user' ? <Avatar className="h-6 w-6"><AvatarFallback>U</AvatarFallback></Avatar> : <Avatar className="h-6 w-6"><AvatarFallback>AI</AvatarFallback></Avatar>}
                </div>
              ))}
            </div>
            {/* Subtitle-style question display */}
            <div className="text-center mt-2">
              <span className="bg-black/70 text-white px-4 py-2 rounded text-lg font-medium shadow" style={{ display: 'inline-block' }}>
                {currentQuestion?.text}
              </span>
            </div>
            {/* Microphone button (Zoom style) */}
            <div className="flex justify-center mt-4">
              <Button
                className={`rounded-full p-6 text-white ${isRecording ? 'bg-red-600' : 'bg-primary'} shadow-lg`}
                onClick={handleMicToggle}
                disabled={isPaused}
              >
                {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
            </div>
            {/* Optionally, show input mode and skip button */}
            <div className="flex items-center justify-center gap-4 mt-2">
              <Badge variant="outline" className="text-xs">
                {inputMode === "voice" ? "Voice Input" : "Text Input"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipQuestion}
                className="text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip
              </Button>
            </div>
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
                    onClick={() => handleAnswerSubmit()}
                    disabled={
                      (inputMode === "text" && !currentAnswer.trim()) ||
                      isPaused
                    }
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

      {!currentQuestion && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg font-semibold">Loading question...</div>
        </div>
      )}
    </div>
  )
}
