"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Video,
  VideoOff,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [captionLine, setCaptionLine] = useState("");
  const [isQuestionComplete, setIsQuestionComplete] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")

  // Video / UI toggles and refs (previously missing)
  const [videoEnabled, setVideoEnabled] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [userStream, setUserStream] = useState<MediaStream | null>(null)
  const [showMessages, setShowMessages] = useState(false)

  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const typewriterRef = useRef<NodeJS.Timeout | null>(null)

  // Manage camera stream when videoEnabled toggles
  useEffect(() => {
    let mounted = true
    if (videoEnabled) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            if (!mounted) return
            setUserStream(stream)
          })
          .catch(() => {
            // If camera access fails, disable video toggle
            setVideoEnabled(false)
          })
      } else {
        setVideoEnabled(false)
      }
    } else {
      if (userStream) {
        userStream.getTracks().forEach((t) => t.stop())
        setUserStream(null)
      }
    }
    return () => {
      mounted = false
    }
  }, [videoEnabled])

  // Attach MediaStream to the video element when available
  useEffect(() => {
    if (videoRef.current && userStream) {
      try {
        // @ts-ignore - srcObject is supported on HTMLVideoElement
        videoRef.current.srcObject = userStream
      } catch {
        // fallback: create object URL if needed (cast to any to satisfy TS)
        const url = URL.createObjectURL(userStream as any)
        videoRef.current.src = url
      }
    } else if (videoRef.current) {
      // Clear if no stream
      try {
        // @ts-ignore
        videoRef.current.srcObject = null
      } catch {
        videoRef.current.src = ""
      }
    }
  }, [userStream])

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
        prompt: `You are acting as a professional technical interviewer for a MERN stack developer role. 
Conduct the interview one question at a time. 

Rules:
- Ask one clear, realistic, and open-ended question relevant to MongoDB, Express, React, or Node.js.
- Do not repeat questions from earlier in this conversation.
- After the candidate responds, provide brief feedback (1–2 sentences) and then either ask a follow-up question or move on to the next topic.
- Keep the style natural and conversational, like a real human interviewer.
- Only return the interviewer’s text (no labels like "Interviewer:" or "Answer:").`,
        history: []
      })
    })
      .then(res => res.json())
      .then(async data => {
        setQuestions([{ id: 1, text: data.text, category: "MERN", timeLimit: 120 }]);
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



  // Typewriter effect for captions: reveal word by word, overwrite line as in film/YouTube subtitles
  const startQuestion = () => {
    setIsAvatarSpeaking(true);
    setCaptionLine("");
    setIsQuestionComplete(false);
    setTimeRemaining(currentQuestion?.timeLimit || 120);
    setTimeout(() => {
      setIsAvatarSpeaking(false);
      startTypewriterCaption();
    }, 2000);
  };

  // Show N words at a time, overwrite the line as in a film/yt subtitle
  const WORDS_PER_LINE = 6;
  const CAPTION_LINE_DELAY = 2200; // ms, slower for more natural reading
  const startTypewriterCaption = () => {
    const text = currentQuestion?.text || "";
    const words = text.split(" ");
    let idx = 0;
    function showNextLine() {
      if (idx < words.length) {
        const line = words.slice(idx, idx + WORDS_PER_LINE).join(" ");
        setCaptionLine(line);
        idx += WORDS_PER_LINE;
        typewriterRef.current = setTimeout(showNextLine, CAPTION_LINE_DELAY);
      } else {
        setIsQuestionComplete(true);
      }
    }
    showNextLine();
  };



  // --- STT Integration ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sttTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Start/stop recording and transcribe (toggle style, max 60s)
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
            if (sttTimerRef.current) clearTimeout(sttTimerRef.current);
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
          // Auto-stop after 60 seconds
          sttTimerRef.current = setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              setIsRecording(false);
              alert('Recording stopped automatically after 60 seconds (max allowed for speech-to-text).');
            }
          }, 60000);
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
        prompt: `You are an expert technical interviewer for a MERN stack developer role. Respond to the candidate as a real interviewer would: give feedback, ask follow-ups, or move to the next topic. Do not repeat previous questions. Make each question or statement unique, relevant to MERN stack, and build on the conversation so far. Only return the question or statement text.`,
        history,
      }),
    });
    const data = await res.json();
    if (data.text) {
      setMessages((prev) => [...prev, { role: 'ai', text: data.text }]);
      setQuestions((prev) => [
        ...prev,
        { id: prev.length + 1, text: data.text, category: "MERN", timeLimit: 120 },
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
          prompt: `Ask a new, unique, and realistic MERN stack developer interview question. Do not repeat previous questions. Only return the question text.`,
          history: questions.map((q, i) => ({ role: "user", parts: [{ text: answers[i]?.text || "" }] })),
        }),
      });
      const data = await res.json();
      if (data.text) {
        setQuestions((prev) => [
          ...prev,
          { id: prev.length + 1, text: data.text, category: "MERN", timeLimit: 120 },
        ]);
        setCurrentQuestionIndex((prev) => prev + 1);
        // Optionally play TTS here
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
  <div className="w-screen h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {loadingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="p-8 bg-white rounded-lg shadow-lg text-lg font-semibold">Loading next question...</div>
        </div>
      )}


      {/* Main Interview Big Screen */}

      <div className="absolute inset-0 w-full h-full">
        {/* AI video/avatar fills background */}
        {videoEnabled && userStream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
            style={{ background: '#222' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <User className="w-48 h-48 text-primary/60 mb-4" />
            <span className="text-2xl text-white/80">AI Interviewer</span>
          </div>
        )}

        {/* Mic/Video controls floating at bottom center */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-6 z-50">
          <Button
            className={`rounded-full p-6 text-white ${isRecording ? 'bg-red-600' : 'bg-primary'} shadow-xl`}
            onClick={handleMicToggle}
            disabled={isPaused}
          >
            {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>
          <Button
            className={`rounded-full p-6 text-white ${videoEnabled ? 'bg-primary' : 'bg-gray-400'} shadow-xl`}
            onClick={() => setVideoEnabled((v) => !v)}
          >
            {videoEnabled ? <Video className="h-8 w-8" /> : <VideoOff className="h-8 w-8" />}
          </Button>
        </div>

        {/* User's own video/avatar as small circle at bottom right */}
        <div className="absolute bottom-8 right-8 z-50 w-32 h-32 rounded-full overflow-hidden border-4 border-white/70 bg-black/60 flex items-center justify-center">
          {videoEnabled && userStream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
              style={{ background: '#222' }}
            />
          ) : (
            <User className="w-16 h-16 text-primary/60" />
          )}
        </div>

        {/* AI Interviewer caption/subtitle at bottom center, typewriter/overwrite effect, raised above controls */}
        <div className="absolute bottom-32 left-0 w-full flex justify-center pointer-events-none z-40">
          <span
            className="text-white text-lg md:text-xl font-mono font-medium tracking-wide drop-shadow-lg select-none"
            style={{ background: "transparent", border: "none", padding: 0 }}
          >
            {captionLine}
          </span>
        </div>
        </div>

        {/* Chat/messages dropdown panel on right */}
        {showMessages && (
          <div className="fixed top-20 right-4 w-80 max-h-[70vh] bg-white/95 rounded-xl shadow-2xl border border-border z-50 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="font-bold text-lg">Messages</span>
              <Button variant="ghost" size="icon" onClick={() => setShowMessages(false)}>
                ×
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`text-left ${msg.role === 'user' ? 'justify-end flex-row-reverse' : ''} flex items-center gap-2`}>
                  <span className={`px-3 py-2 rounded-lg text-base shadow ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>{msg.text}</span>
                  {msg.role === 'user' ? <Avatar className="h-6 w-6"><AvatarFallback>U</AvatarFallback></Avatar> : <Avatar className="h-6 w-6"><AvatarFallback>AI</AvatarFallback></Avatar>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
   
  );
}
