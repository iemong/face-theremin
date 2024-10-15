import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { useAudio } from "@/hooks/use-audio.ts";
import * as faceapi from "face-api.js";
import { renderPermissionInstructions } from "@/components/PermissionInstructions.tsx";
import {getNote, getNoteInSolfege, mapRange, noteFrequencies} from "@/lib/utils.ts";

const MIN_FREQUENCY = noteFrequencies.at(12 * 2 - 6)?.freq ?? 0;
const MAX_FREQUENCY = noteFrequencies.at(12 * 3 + 6)?.freq ?? 0;

function App() {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState>("prompt");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [currentNote, setCurrentNote] = useState("A4");

  const setupCamera = async () => {
    try {
      await checkPermissionStatus();
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setPermissionStatus("granted");
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (e) {
      console.log(e);
      if (e instanceof Error && e.name === "NotAllowedError") {
        toast({
          title: "カメラの使用が許可されていません",
        });
        setPermissionStatus("denied");
      }
    }
  };

  const checkPermissionStatus = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const status = await navigator.permissions.query({ name: "camera" });
      setPermissionStatus(status.state);
      status.onchange = () => setPermissionStatus(status.state);
    } catch (e) {
      console.error("Permission API is not supported", e);
    }
  };

  const { isPlaying, setupAudio, playAudio, stopAudio, changeFrequency } =
    useAudio();

  const handleSetup = async () => {
    await setupCamera();
    setupAudio();
    await setupFaceApi();
  };

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const [frequency, setFrequency] = useState(440);
  const [currentSolfege, setCurrentSolfege] = useState("ラ");

  const handleFrequencyChange = (newValue: number[]) => {
    setFrequency(newValue[0]);
    changeFrequency(newValue[0]);
    const note = getNote(frequency);
    setCurrentNote(note);
    setCurrentSolfege(getNoteInSolfege(note));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const setupFaceApi = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    console.info("=== Setup face-api ===");
  };

  const setupCanvas = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) {
      return;
    }
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
  }, []);

  const startDetectingFace = useCallback(async () => {
    setupCanvas();
    if (
      !videoRef.current ||
      !canvasRef.current ||
      requestIdRef.current !== null
    ) {
      return;
    }
    const detectFace = async () => {
      if (!isDetecting) {
        return;
      }
      const detection = await faceapi.detectSingleFace(
        videoRef.current!,
        new faceapi.TinyFaceDetectorOptions(),
      );

      if (detection) {
        const box = detection.box;
        const totalArea =
          videoRef.current!.videoWidth * videoRef.current!.videoHeight;
        const relativeArea = box.area / totalArea;
        const mappedArea = mapRange(relativeArea, 0.04, 0.38, 0, 1);
        // const logArea = Math.log(mappedArea * 100 + 1) / Math.log(101);
        // const frequency =
        //   MIN_FREQUENCY + (MAX_FREQUENCY - MIN_FREQUENCY) * logArea;
        const frequency = mapRange(mappedArea, 0, 1, MIN_FREQUENCY, MAX_FREQUENCY);
        handleFrequencyChange([frequency]);
        // const resizedDetections = faceapi.resizeResults(detection, {
        //   width: canvasRef.current!.width,
        //   height: canvasRef.current!.height,
        // });
        // if (resizedDetections) {
        //   const canvas = canvasRef.current!;
        //   const ctx = canvas.getContext("2d");
        //   ctx?.clearRect(0, 0, canvas.width, canvas.height);
        //   faceapi.draw.drawDetections(canvasRef.current!, resizedDetections);
        // }
      }
      requestIdRef.current = requestAnimationFrame(detectFace);
    };
    setIsDetecting(true);
    detectFace();
  }, [handleFrequencyChange, isDetecting, setupCanvas]);

  const stopDetectingFace = useCallback(() => {
    if (!requestIdRef.current) {
      return;
    }
    setIsDetecting(false);
    cancelAnimationFrame(requestIdRef.current);
    requestIdRef.current = null;
  }, []);

  useEffect(() => {
    const loop = async () => {
      if (isDetecting) {
        await startDetectingFace();
      } else {
        if (!requestIdRef.current) {
          return;
        }
        cancelAnimationFrame(requestIdRef.current);
        requestIdRef.current = null;
      }
    };
    loop();
    return () => {
      if (!requestIdRef.current) {
        return;
      }
      cancelAnimationFrame(requestIdRef.current);
      requestIdRef.current = null;
    };
  }, [startDetectingFace, isDetecting]);

  return (
    <main className={"w-screen h-screen"}>
      {renderPermissionInstructions(permissionStatus)}
      <div className={"p-4"}>
        <div className={"mb-2"}>
          <p>Frequency: {frequency.toFixed(2)} Hz</p>
          <p>Closest Note: {currentNote}</p>
          <p>Solfege: {currentSolfege}</p>
        </div>
      </div>
      <div className={"relative inline-block"}>
        <video ref={videoRef} autoPlay muted className={"object-cover"} />
        <canvas ref={canvasRef} className={"size-full absolute top-0 left-0"} />
      </div>
      <div className={"flex gap-4"}>
        <Button onClick={handleSetup}>Play</Button>
        {isPlaying ? (
          <Button onClick={stopAudio}>Stop</Button>
        ) : (
          <Button onClick={playAudio}>Play</Button>
        )}
        <Button onClick={isDetecting ? stopDetectingFace : startDetectingFace}>
          {isDetecting ? "stop Detecting" : "start Detecting"}
        </Button>
      </div>
    </main>
  );
}

export default App;
