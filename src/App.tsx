import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { useAudio } from "@/hooks/use-audio.ts";

function App() {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState>("prompt");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

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
      console.log(status);
      setPermissionStatus(status.state);
      status.onchange = () => setPermissionStatus(status.state);
    } catch (e) {
      console.error("Permission API is not supported", e);
    }
  };

  const { isPlaying, setupAudio, playAudio, stopAudio } = useAudio();

  const handleSetup = async () => {
    await setupCamera();
    setupAudio();
  };

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const renderPermissionInstructions = () => {
    switch (permissionStatus) {
      case "denied":
        return (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">
              カメラへのアクセスが拒否されています。
            </strong>
            <p className="block sm:inline">
              ブラウザの設定でカメラへのアクセスを許可してください。
            </p>
            <p>
              設定方法:
              <ol className="list-decimal list-inside">
                <li>
                  ブラウザのアドレスバーの左側にあるカメラアイコンをクリック
                </li>
                <li>「常に許可」を選択</li>
                <li>ページをリロード</li>
              </ol>
            </p>
          </div>
        );
      case "prompt":
        return (
          <p className="text-yellow-600">
            アプリを開始すると、カメラへのアクセス許可を求められます。
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <main className={"w-screen h-screen"}>
      {renderPermissionInstructions()}
      <video ref={videoRef} autoPlay muted className={"object-cover"} />
      <Button onClick={handleSetup}>Play</Button>
      {isPlaying ? (
        <Button onClick={stopAudio}>Stop</Button>
      ) : (
        <Button onClick={playAudio}>Play</Button>
      )}
    </main>
  );
}

export default App;
