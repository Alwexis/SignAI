import React, { useEffect, useState, useRef } from "react";
import ResultDisplay from "./ResultDisplay";

interface SeñasPageProps {
  sala: string;
}

const SeñasPage: React.FC<SeñasPageProps> = ({ sala }) => {
  // const __api_url__ = "http://localhost:8000/";
  const __api_url__ = "http://207.244.231.246:8000/";
  // const __ws_url__ = "ws://localhost:8000/ws";
  const __ws_url__ = "ws://207.244.231.246:8000/";

  const [images, setImages] = useState<string[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        setVideoBlob(new Blob(chunks, { type: "video/webm" }));
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVideo = async () => {
    if (videoBlob) {
      try {
        const formData = new FormData();
        formData.append("file", videoBlob);
        formData.append("sala", sala);

        setIsUploading(true);

        const response = await fetch(`${__api_url__}video-to-text`, {
          method: "POST",
          headers: {
            "x-api-key": "__bypass__",
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.statusText}`);
        }

        const data = await response.json();
        setIsUploading(false);
        setVideoBlob(null);
      } catch (error) {
        console.error("Error al subir el video:", error);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoBlob(file);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`${__ws_url__}ws?sala=${sala}`);
    ws.onopen = () => console.log(`Conectado a la sala: ${sala}`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      //? Acá recibimos imagenes
      if (data.resultType == 'images') {
        // console.log("Mensaje recibido:", data);
        // setMessage(data.predictions.map((p: any) => p.sign).join(" "));
        setImages(data.images);
      }
    };
    ws.onerror = (error) => console.error("Error en el WebSocket:", error);
    ws.onclose = () => console.log("WebSocket cerrado");

    return () => ws.close();
  }, [sala]);

  return (
    <div className="flex justify-between p-6 min-h-screen w-full max-w-4xl bg-gray-100">
      <div className="flex-1 mr-6 max-w-md">
        <h1 className="mb-6 text-2xl font-bold">
          Comunicación por Señas - Sala: {sala}
        </h1>
        <div className="space-y-4">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full max-h-64 mb-4 bg-black"
          />
          <div className="flex justify-between">
            <button disabled={isUploading}
              onClick={isRecording ? stopRecording : startRecording}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 h-10 px-4 py-2"
            >
              {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
            </button>
            <div>
              <input
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hidden"
                accept="video/*"
                type="file"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 h-10 px-4 py-2"
              >
                Subir video propio
              </button>
            </div>
          </div>
          {videoBlob && (
            <button
              onClick={uploadVideo} disabled={isUploading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 h-10 px-4 py-2"
            >
              { isUploading ? "Subiendo..." : "Subir Video" }
            </button>
          )}
        </div>
      </div>
      <ResultDisplay
        images={images}
        resultType="image"
        text=""
      />
    </div>
  );
};

export default SeñasPage;
