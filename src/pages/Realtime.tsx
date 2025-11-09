import { useState, useRef, useEffect } from 'react';
import { Shield, BarChart3, FileText, Radio, Upload, Video, Square, AlertTriangle, Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Timeline, TimelineEvent } from "@/components/Timeline";
import { toast } from "sonner";
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import { Phase1DetectionManager, calculatePersonHeight, calculateCenterY } from '@/utils/detectionAlgorithms';
import { DetectionEvent, Phase1Detection, Phase2Detection, DEFAULT_DETECTION_CONFIG } from '@/types/detection';
import { videoStorage, RecordingMetadata } from '@/lib/videoStorage';

const Realtime = () => {
  // Video and recording state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const phase2IntervalRef = useRef<NodeJS.Timeout>();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const recordingStartTimeRef = useRef<number>(0); // Ref for accurate duration calculation
  const [currentRecordingId, setCurrentRecordingId] = useState<string>('');

  // Detection state
  const [phase1Enabled, setPhase1Enabled] = useState(true);
  const [phase2Enabled, setPhase2Enabled] = useState(false);
  const [detections, setDetections] = useState<DetectionEvent[]>([]);
  const detectionsRef = useRef<DetectionEvent[]>([]); // Ref for accessing current detections in callbacks
  const [poseDetector, setPoseDetector] = useState<poseDetection.PoseDetector | null>(null);
  const detectionManagerRef = useRef<Phase1DetectionManager>(new Phase1DetectionManager(DEFAULT_DETECTION_CONFIG));

  // Playback state
  const [savedRecordings, setSavedRecordings] = useState<RecordingMetadata[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<RecordingMetadata | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);

  // Audio transcript state (Web Speech API)
  const [audioTranscript, setAudioTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null); // SpeechRecognition instance
  const finalTranscriptRef = useRef<string>(''); // Store only final transcripts for saving

  // Initialize TensorFlow and pose detection model
  useEffect(() => {
    const initTensorFlow = async () => {
      try {
        await tf.ready();
        console.log('✅ TensorFlow.js initialized');

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
          }
        );
        setPoseDetector(detector);
        console.log('✅ MoveNet pose detector initialized');
      } catch (error) {
        console.error('Failed to initialize TensorFlow:', error);
        toast.error('Failed to initialize pose detection');
      }
    };

    initTensorFlow();
  }, []);

  // Load saved recordings
  useEffect(() => {
    const loadRecordings = async () => {
      try {
        await videoStorage.init();
        const recordings = await videoStorage.getAllRecordings();
        setSavedRecordings(recordings);
      } catch (error) {
        console.error('Failed to load recordings:', error);
      }
    };

    loadRecordings();
  }, []);

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      toast.success('Webcam started');
    } catch (error) {
      console.error('Failed to start webcam:', error);
      toast.error('Failed to access webcam');
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Initialize Web Speech API for audio transcription
  const initSpeechRecognition = () => {
    try {
      // Check for browser support (Chrome/Edge)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn('⚠️ Speech Recognition not supported in this browser');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening
      recognition.interimResults = true; // Get interim results for real-time updates
      recognition.lang = 'en-US';

      // Update transcript as speech is detected
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        // Collect all results (both interim and final)
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Accumulate final transcripts in ref (for saving)
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
          console.log('🎤 Final speech saved:', finalTranscript);
        }

        // Display both final and interim transcripts in UI
        const displayTranscript = finalTranscriptRef.current + interimTranscript;
        setAudioTranscript(displayTranscript);

        if (interimTranscript) {
          console.log('🎤 Interim speech (showing but not saved):', interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('⚠️ Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        // Restart if still recording
        if (isRecording) {
          try {
            recognition.start();
            console.log('🔄 Speech recognition restarted');
          } catch (err) {
            console.warn('⚠️ Could not restart speech recognition:', err);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      console.log('✅ Speech recognition started');
    } catch (err) {
      console.warn('⚠️ Failed to initialize speech recognition:', err);
    }
  };

  // Stop speech recognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        console.log('⏹️ Speech recognition stopped');
      } catch (err) {
        console.warn('⚠️ Error stopping speech recognition:', err);
      }
    }
  };

  // Capture frame as base64
  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  };


  // Run Phase 2 detection (VLM analysis)
  const runPhase2Detection = async () => {
    if (!phase2Enabled || !isRecording) return;

    try {
      console.log('🔍 Phase 2: Running VLM analysis...');
      const frameDataUrl = captureFrame();
      if (!frameDataUrl) {
        console.warn('⚠️ Phase 2: No frame data available');
        return;
      }

      const currentTime = (Date.now() - recordingStartTime) / 1000;

      // Get pose data if available
      let poseData = null;
      if (poseDetector && videoRef.current) {
        const poses = await poseDetector.estimatePoses(videoRef.current);
        if (poses.length > 0) {
          poseData = poses.map(pose => ({
            keypoints: pose.keypoints,
            personHeight: calculatePersonHeight(pose.keypoints),
            centerY: calculateCenterY(pose.keypoints)
          }));
          console.log('🔍 Phase 2: Pose data included:', poseData.length, 'person(s)');
        }
      }

      const response = await fetch('http://localhost:3001/api/analyze-vlm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameDataUrl,
          poseData,
          timestamp: currentTime
        })
      });

      const data = await response.json();
      console.log('🔍 Phase 2: VLM response:', data.analysis);

      if (data.analysis.threatDetected) {
        const detection: Phase2Detection = {
          type: 'vlm_detection',
          timestamp: currentTime,
          confidence: data.analysis.confidence,
          description: data.analysis.description,
          category: data.analysis.category,
          explanation: data.analysis.explanation
        };

        setDetections(prev => {
          const updated = [...prev, detection];
          detectionsRef.current = updated;
          return updated;
        });

        toast.error(`Phase 2: ${detection.description}`, {
          description: detection.explanation
        });

        // Send email alert
        sendEmailAlert(detection);
      } else {
        console.log('✅ Phase 2: No threat detected');
      }

    } catch (error) {
      console.error('❌ Phase 2 detection error:', error);
    }
  };

  // Send email alert
  const sendEmailAlert = async (detection: DetectionEvent) => {
    try {
      const frameDataUrl = captureFrame();

      await fetch('http://localhost:3001/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detectionType: detection.type,
          description: detection.description,
          timestamp: new Date().toISOString(),
          frameDataUrl,
          cameraId: 'Webcam'
        })
      });

      console.log('📧 Email alert sent for:', detection.type);
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  };

  // Detection loop
  useEffect(() => {
    if (!isRecording || !phase1Enabled || !poseDetector) {
      console.log('Detection loop not starting:', { isRecording, phase1Enabled, hasPoseDetector: !!poseDetector });
      return;
    }

    console.log('🎬 Starting Phase 1 detection loop');
    let isActive = true;

    const runDetectionLoop = async () => {
      if (!isActive) return;

      try {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Estimate poses
        const poses = await poseDetector.estimatePoses(video);

        if (poses.length > 0) {
          const pose = poses[0];
          const currentTime = (Date.now() - recordingStartTime) / 1000;

          // Draw keypoints on canvas
          pose.keypoints.forEach((kp: any) => {
            if (kp.score && kp.score > 0.3) {
              // Draw circle
              ctx.beginPath();
              ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
              ctx.fillStyle = kp.score > 0.6 ? "#00ff00" : "#ffff00";
              ctx.fill();
              ctx.strokeStyle = "#000000";
              ctx.lineWidth = 2;
              ctx.stroke();

              // Draw label
              if (kp.name) {
                const labelText = kp.name
                  .split('_')
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');

                ctx.font = "12px Arial";
                const textMetrics = ctx.measureText(labelText);

                // Background
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(kp.x + 8, kp.y - 6, textMetrics.width + 6, 16);

                // Text
                ctx.fillStyle = "white";
                ctx.fillText(labelText, kp.x + 11, kp.y + 4);
              }
            }
          });

          // Run detections
          const newDetections = detectionManagerRef.current.detectAll(
            pose.keypoints,
            currentTime
          );

          // Debug: Log pose data periodically
          if (Math.floor(currentTime) % 5 === 0 && Math.floor(currentTime * 10) % 10 === 0) {
            console.log('🔍 Debug - Pose data:', {
              personHeight: calculatePersonHeight(pose.keypoints),
              centerY: calculateCenterY(pose.keypoints),
              keypointCount: pose.keypoints.filter((kp: any) => kp.score && kp.score > 0.3).length,
              time: currentTime.toFixed(1)
            });
          }

          if (newDetections.length > 0) {
            setDetections(prev => {
              const updated = [...prev, ...newDetections];
              detectionsRef.current = updated;
              return updated;
            });

            newDetections.forEach(detection => {
              console.log('🚨 Detection:', detection.type, detection.description);
              toast.warning(`Phase 1: ${detection.description}`, {
                description: `Confidence: ${(detection.confidence * 100).toFixed(0)}%`
              });

              // Send email alert
              sendEmailAlert(detection);
            });
          }
        }
      } catch (error) {
        console.error('Phase 1 detection error:', error);
      }

      // Schedule next detection
      if (isActive) {
        setTimeout(() => runDetectionLoop(), 100); // 10 FPS for smoother visualization
      }
    };

    runDetectionLoop();

    return () => {
      isActive = false;
    };
  }, [isRecording, phase1Enabled, poseDetector, recordingStartTime]);

  // Phase 2 interval
  useEffect(() => {
    if (!isRecording || !phase2Enabled) return;

    phase2IntervalRef.current = setInterval(() => {
      runPhase2Detection();
    }, 1500); // Every 1.5 seconds for near real-time detection

    return () => {
      if (phase2IntervalRef.current) {
        clearInterval(phase2IntervalRef.current);
      }
    };
  }, [isRecording, phase2Enabled]);

  // Start recording
  const startRecording = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      toast.error('Start webcam first');
      return;
    }

    try {
      // Reset and start speech recognition
      finalTranscriptRef.current = '';
      setAudioTranscript('');
      initSpeechRecognition();

      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;

        console.log('🎬 Saving recording with detections:', detectionsRef.current);
        console.log('🎬 Duration:', duration, 'seconds');

        const recording: RecordingMetadata = {
          id: currentRecordingId,
          timestamp: new Date(recordingStartTimeRef.current),
          duration,
          events: detectionsRef.current.map(d => ({
            type: d.type === 'vlm_detection' ? 'vlm_detection' : d.type,
            timestamp: d.timestamp,
            confidence: d.confidence,
            description: d.description
          })),
          transcript: finalTranscriptRef.current || 'No speech detected',
          blob
        };

        console.log('🎬 Recording object:', {
          ...recording,
          blob: `Blob(${blob.size} bytes)`,
          events: recording.events
        });

        await videoStorage.saveRecording(recording);

        const recordings = await videoStorage.getAllRecordings();
        setSavedRecordings(recordings);

        toast.success('Recording saved successfully');
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;

      const recordingId = `recording-${Date.now()}`;
      const startTime = Date.now();
      setCurrentRecordingId(recordingId);
      setRecordingStartTime(startTime);
      recordingStartTimeRef.current = startTime; // Set ref for accurate duration
      setIsRecording(true);
      setDetections([]);
      detectionsRef.current = []; // Also reset ref
      detectionManagerRef.current.reset();

      toast.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop speech recognition
      stopSpeechRecognition();

      toast.info('Recording stopped');
    }
  };

  // Play saved recording
  const playRecording = (recording: RecordingMetadata) => {
    console.log('▶️ Playing recording:', {
      id: recording.id,
      duration: recording.duration,
      eventsCount: recording.events.length,
      events: recording.events,
      hasTranscript: !!recording.transcript
    });

    setSelectedRecording(recording);

    if (videoRef.current) {
      const url = URL.createObjectURL(recording.blob);
      stopWebcam();
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.play();
    }

    const mappedDetections = recording.events.map(e => ({
      ...e,
      description: e.description || `${e.type} detection`,
      ...(e.type === 'vlm_detection' ? { category: 'unknown', explanation: '' } : { keypoints: [] })
    } as DetectionEvent));

    console.log('▶️ Mapped detections:', mappedDetections);
    setDetections(mappedDetections);
    detectionsRef.current = mappedDetections; // Also update ref
  };

  // Delete recording
  const deleteRecording = async (id: string) => {
    try {
      await videoStorage.deleteRecording(id);
      const recordings = await videoStorage.getAllRecordings();
      setSavedRecordings(recordings);

      if (selectedRecording?.id === id) {
        setSelectedRecording(null);
        if (videoRef.current) {
          videoRef.current.src = '';
        }
      }

      toast.success('Recording deleted');
    } catch (error) {
      console.error('Failed to delete recording:', error);
      toast.error('Failed to delete recording');
    }
  };

  // Download recording
  const downloadRecording = (recording: RecordingMetadata) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.id}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download started');
  };

  // Update playback time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setPlaybackTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const timelineEvents: TimelineEvent[] = detections.map(d => ({
    timestamp: d.timestamp,
    type: d.type === 'vlm_detection' ? 'vlm_detection' : d.type,
    label: d.description,
    confidence: d.confidence
  }));

  const currentDuration = selectedRecording?.duration || (isRecording ? (Date.now() - recordingStartTime) / 1000 : 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 cyber-bg">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animation: "float-particle 15s linear infinite",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="mb-6 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded bg-primary/20 border border-primary flex items-center justify-center glow-cyber">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-wider">View<span className="text-primary">Guard</span></h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Live Analysis</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/monitor">
                <Shield className="w-4 h-4" />
                Monitor
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/upload">
                <Upload className="w-4 h-4" />
                Upload
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/reports">
                <FileText className="w-4 h-4" />
                Reports
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/analytics">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Video Feed</CardTitle>
              <CardDescription>
                {isRecording ? 'Recording in progress...' : 'Start webcam and begin detection'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={!selectedRecording}
                  className="w-full h-full object-contain absolute top-0 left-0"
                />
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain absolute top-0 left-0 z-10"
                  style={{ display: isRecording ? 'block' : 'none' }}
                />
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium z-20">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    REC
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3">
                {!selectedRecording && (
                  <>
                    <Button onClick={startWebcam} variant="outline" className="gap-2">
                      <Video className="w-4 h-4" />
                      Start Webcam
                    </Button>
                    {!isRecording ? (
                      <Button onClick={startRecording} variant="default" className="gap-2">
                        <Video className="w-4 h-4" />
                        Start Detection
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} variant="destructive" className="gap-2">
                        <Square className="w-4 h-4" />
                        Stop Detection
                      </Button>
                    )}
                  </>
                )}
                {selectedRecording && (
                  <Button onClick={() => {
                    setSelectedRecording(null);
                    if (videoRef.current) {
                      videoRef.current.src = '';
                    }
                    startWebcam();
                  }} variant="outline">
                    Back to Webcam
                  </Button>
                )}
              </div>

              {/* Timeline */}
              {(isRecording || selectedRecording) && (
                <Timeline
                  duration={currentDuration}
                  currentTime={playbackTime}
                  events={timelineEvents}
                  onSeek={(time) => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                    }
                  }}
                />
              )}

              {/* Audio Transcript (during recording) */}
              {isRecording && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-300 text-sm font-medium">🎤 Audio Transcript:</span>
                    {recognitionRef.current && (
                      <span className="text-green-400 text-xs animate-pulse">● LISTENING</span>
                    )}
                  </div>
                  <ScrollArea className="h-24 w-full">
                    <p className="text-white text-sm font-mono whitespace-pre-wrap">
                      {audioTranscript || "No speech detected..."}
                    </p>
                  </ScrollArea>
                  <p className="text-xs text-slate-500 mt-2">
                    Audio is captured during recording and saved with the video
                  </p>
                </div>
              )}

              {/* Detected Events List (during playback) */}
              {selectedRecording && selectedRecording.events.length > 0 && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="text-slate-300 text-sm font-medium mb-3">⚠️ Detected Events - Click to Jump to Timestamp</h3>
                  <ScrollArea className="h-48 w-full">
                    <div className="space-y-2">
                      {selectedRecording.events.map((event, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            if (videoRef.current) {
                              const seekTime = Math.max(0, event.timestamp - 1);
                              videoRef.current.currentTime = seekTime;
                            }
                          }}
                          className="p-3 bg-slate-700 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-white text-sm font-medium capitalize">
                              {event.type.replace('_', ' ')}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {event.timestamp.toFixed(1)}s
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-slate-300 text-xs">
                              {event.description}
                            </p>
                          )}
                          <div className="text-slate-400 text-xs mt-1">
                            Confidence: {(event.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Audio Transcript (during playback) */}
              {selectedRecording && selectedRecording.transcript && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h3 className="text-slate-300 text-sm font-medium mb-2">🎤 Recorded Audio Transcript:</h3>
                  <ScrollArea className="h-32 w-full">
                    <p className="text-white text-sm font-mono whitespace-pre-wrap">
                      {selectedRecording.transcript}
                    </p>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detection Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Phase 1 Detection (Browser-based)</Label>
                  <p className="text-sm text-muted-foreground">
                    Fall, unconscious person, person on ground, hands raised
                  </p>
                </div>
                <Switch
                  checked={phase1Enabled}
                  onCheckedChange={setPhase1Enabled}
                  disabled={isRecording}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Phase 2 Detection (VLM Analysis)</Label>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI threat detection - 1.5s interval (requires API)
                  </p>
                </div>
                <Switch
                  checked={phase2Enabled}
                  onCheckedChange={setPhase2Enabled}
                  disabled={isRecording}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Detected Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Detected Events ({detections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {detections.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No events detected yet
                    </p>
                  ) : (
                    detections.map((detection, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          if (videoRef.current && selectedRecording) {
                            // Seek 1 second before event for context
                            const seekTime = Math.max(0, detection.timestamp - 1);
                            videoRef.current.currentTime = seekTime;
                          }
                        }}
                        className={`border border-border rounded-lg p-3 space-y-1 ${
                          selectedRecording ? 'cursor-pointer hover:bg-slate-700 transition-colors' : ''
                        }`}
                        title={selectedRecording ? `Click to jump to ${detection.timestamp.toFixed(1)}s` : ''}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium capitalize">
                            {detection.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {detection.timestamp.toFixed(1)}s
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {detection.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {(detection.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Saved Recordings */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Recordings ({savedRecordings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {savedRecordings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No recordings saved yet
                    </p>
                  ) : (
                    savedRecordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="border border-border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {new Date(recording.timestamp).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {recording.duration.toFixed(1)}s
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Events: {recording.events.length}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playRecording(recording)}
                            className="flex-1"
                          >
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadRecording(recording)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteRecording(recording.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Realtime;
