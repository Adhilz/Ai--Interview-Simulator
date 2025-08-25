"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Camera,
  Mic,
  MicOff,
  CameraOff,
  ArrowRight,
  ArrowLeft,
  Brain,
  Settings,
  CheckCircle,
  AlertTriangle,
  Play,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function InterviewSetup() {
  const [micEnabled, setMicEnabled] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("")
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("")
  const [permissionStatus, setPermissionStatus] = useState<{
    camera: "granted" | "denied" | "prompt" | "unknown"
    microphone: "granted" | "denied" | "prompt" | "unknown"
  }>({
    camera: "unknown",
    microphone: "unknown",
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkPermissions()
    getDevices()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const checkPermissions = async () => {
    try {
      const cameraPermission = await navigator.permissions.query({ name: "camera" as PermissionName })
      const microphonePermission = await navigator.permissions.query({ name: "microphone" as PermissionName })

      setPermissionStatus({
        camera: cameraPermission.state,
        microphone: microphonePermission.state,
      })
    } catch (error) {
      console.log("[v0] Permission check not supported:", error)
    }
  }

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter((device) => device.kind === "audioinput")
      const videoInputs = devices.filter((device) => device.kind === "videoinput")

      setAudioDevices(audioInputs)
      setVideoDevices(videoInputs)

      if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId)
      if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId)
    } catch (error) {
      console.log("[v0] Error getting devices:", error)
    }
  }

  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: cameraEnabled
          ? {
              deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
              width: { ideal: 640 },
              height: { ideal: 480 },
            }
          : false,
        audio: micEnabled
          ? {
              deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
            }
          : false,
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)

      if (videoRef.current && cameraEnabled) {
        videoRef.current.srcObject = newStream
      }

      if (micEnabled) {
        setupAudioAnalyzer(newStream)
      }

      setPermissionStatus({
        camera: cameraEnabled ? "granted" : permissionStatus.camera,
        microphone: micEnabled ? "granted" : permissionStatus.microphone,
      })
    } catch (error) {
      console.log("[v0] Error accessing media:", error)
      setPermissionStatus({
        camera: cameraEnabled ? "denied" : permissionStatus.camera,
        microphone: micEnabled ? "denied" : permissionStatus.microphone,
      })
    }
  }

  const setupAudioAnalyzer = (mediaStream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(mediaStream)

      analyser.fftSize = 256
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const updateMicLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)

          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
          setMicLevel(Math.min(100, (average / 128) * 100))
        }

        if (micEnabled) {
          requestAnimationFrame(updateMicLevel)
        }
      }

      updateMicLevel()
    } catch (error) {
      console.log("[v0] Error setting up audio analyzer:", error)
    }
  }

  const handleMicToggle = (enabled: boolean) => {
    setMicEnabled(enabled)
    if (!enabled) {
      setMicLevel(0)
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }

  const handleCameraToggle = (enabled: boolean) => {
    setCameraEnabled(enabled)
    if (!enabled && videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    if (micEnabled || cameraEnabled) {
      startCamera()
    } else if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [micEnabled, cameraEnabled, selectedAudioDevice, selectedVideoDevice])

  const continueToInterview = () => {
    router.push("/ai-interview")
  }

  const goBack = () => {
    router.push("/resume-upload")
  }

  const getPermissionIcon = (status: string) => {
    switch (status) {
      case "granted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "denied":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Settings className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPermissionText = (status: string) => {
    switch (status) {
      case "granted":
        return "Permission granted"
      case "denied":
        return "Permission denied"
      default:
        return "Permission needed"
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
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold font-heading">AI Interview Simulator</h1>
            </div>
            <Badge variant="outline" className="text-sm">
              Step 2 of 4
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-heading">Setup Your Interview Environment</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Resume Upload</span>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Interview Setup</span>
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span>AI Interview</span>
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span>Results</span>
            </div>
          </div>
          <Progress value={50} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Section */}
          <div className="space-y-6">
            {/* Camera Settings */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Camera className="h-5 w-5 text-primary" />
                  Camera Settings
                </CardTitle>
                <CardDescription>Configure your camera for the interview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cameraEnabled ? (
                      <Camera className="h-5 w-5 text-primary" />
                    ) : (
                      <CameraOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <h4 className="font-semibold">Enable Camera</h4>
                      <p className="text-sm text-muted-foreground">Show yourself during the interview</p>
                    </div>
                  </div>
                  <Switch checked={cameraEnabled} onCheckedChange={handleCameraToggle} />
                </div>

                {cameraEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Camera Device</label>
                      <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                        <SelectContent>
                          {videoDevices.map((device) => (
                            <SelectItem key={device.deviceId} value={device.deviceId}>
                              {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {getPermissionIcon(permissionStatus.camera)}
                      <span className="text-muted-foreground">{getPermissionText(permissionStatus.camera)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Microphone Settings */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Mic className="h-5 w-5 text-secondary" />
                  Microphone Settings
                </CardTitle>
                <CardDescription>Configure your microphone for voice responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {micEnabled ? (
                      <Mic className="h-5 w-5 text-secondary" />
                    ) : (
                      <MicOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <h4 className="font-semibold">Enable Microphone</h4>
                      <p className="text-sm text-muted-foreground">Speak your answers aloud</p>
                    </div>
                  </div>
                  <Switch checked={micEnabled} onCheckedChange={handleMicToggle} />
                </div>

                {micEnabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Microphone Device</label>
                      <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select microphone" />
                        </SelectTrigger>
                        <SelectContent>
                          {audioDevices.map((device) => (
                            <SelectItem key={device.deviceId} value={device.deviceId}>
                              {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {getPermissionIcon(permissionStatus.microphone)}
                      <span className="text-muted-foreground">{getPermissionText(permissionStatus.microphone)}</span>
                    </div>

                    {/* Mic Level Indicator */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Microphone Level</span>
                        <span className="font-medium">{Math.round(micLevel)}%</span>
                      </div>
                      <div className="flex items-center gap-1 h-4">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-full rounded-sm transition-all duration-150 ${
                              i < (micLevel / 100) * 20
                                ? i < 14
                                  ? "bg-green-500"
                                  : i < 18
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Options */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Settings className="h-5 w-5 text-accent" />
                  Interview Options
                </CardTitle>
                <CardDescription>Customize your interview experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Text-to-Speech</h4>
                    <p className="text-sm text-muted-foreground">Hear questions spoken aloud</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Show Subtitles</h4>
                    <p className="text-sm text-muted-foreground">Display question text on screen</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Practice Mode</h4>
                    <p className="text-sm text-muted-foreground">Get hints and guidance during interview</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {/* Camera Preview */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Camera className="h-5 w-5 text-primary" />
                  Camera Preview
                </CardTitle>
                <CardDescription>This is how you'll appear during the interview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted/20 rounded-lg overflow-hidden relative">
                  {cameraEnabled && stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          videoRef.current.play()
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <CameraOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {cameraEnabled ? "Starting camera..." : "Camera disabled"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mic indicator overlay */}
                  {micEnabled && (
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
                        <Mic className="h-4 w-4 text-white" />
                        <div className="flex items-center gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 bg-white rounded-full transition-all duration-150 ${
                                i < (micLevel / 100) * 4 ? "h-3 opacity-100" : "h-1 opacity-30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Check */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  System Check
                </CardTitle>
                <CardDescription>Verify your setup is ready for the interview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Browser compatibility</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Internet connection</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Camera access</span>
                  {permissionStatus.camera === "granted" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microphone access</span>
                  {permissionStatus.microphone === "granted" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ready to Start */}
            <Card className="glass border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading mb-2">Ready to Begin!</h3>
                    <p className="text-muted-foreground mb-4">
                      Your setup looks good. Click below to start your AI interview session.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={goBack} className="hover:scale-105 transition-all bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resume Upload
          </Button>

          <Button
            onClick={continueToInterview}
            className="hover:scale-105 transition-all duration-300 group animate-pulse-glow"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Begin Interview
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}
