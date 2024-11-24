import { useState, useRef, useEffect } from "react";
import ResultDisplay from "./ResultDisplay";
import WaveformVisualizer from "./WaveformVisualizer";

interface VozPageProps {
  sala: string;
}

// export default function VoiceCommunication({ params }: { params: { sala: string } }) {
const VoicePage: React.FC<VozPageProps> = ({ sala }) => {
  // const __api_url__ = "http://localhost:8000/";
  const __api_url__ = "http://207.244.231.246:8000/";
  // const __ws_url__ = "ws://localhost:8000/ws";
  const __ws_url__ = "ws://207.244.231.246:8000/";

  const [message, setMessage] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
        setAudioStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (audioBlob) {
      try {
        const formData = new FormData();
        formData.append("file", audioBlob);
        formData.append("sala", sala);

        setIsUploading(true);

        const response = await fetch(`${__api_url__}speech-to-text`, {
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
        setAudioBlob(null);
      } catch (error) {
        console.error("Error al subir el audio:", error);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioBlob(file);
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`${__ws_url__}ws?sala=${sala}`);
    ws.onopen = () => console.log(`Conectado a la sala: ${sala}`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.resultType == 'text') {
        const _raw_señas: string[] = data.predictions.map((p: any) => p.sign);
        let señas = [];
        let prevSeña = "";
        for (let i = 0; i < _raw_señas.length; i++) {
          if (prevSeña != _raw_señas[i]) {
            señas.push(_raw_señas[i]);
            prevSeña = _raw_señas[i];
          }
        }
        setMessage(señas.join(" "));
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
          Comunicación por Voz - Sala: {sala}
        </h1>
        <div className="space-y-4">
          <WaveformVisualizer audioStream={audioStream} />
          <section className="flex justify-between w-full">
            <button
              disabled={isUploading}
              onClick={isRecording ? stopRecording : startRecording}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 h-10 px-4 py-2"
            >
              {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
            </button>
            <div>
              <input
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                accept="audio/*"
                type="file"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 h-10 px-4 py-2"
              >
                Subir audio propio
              </button>
            </div>
          </section>
          {audioBlob && (
            <button
              onClick={uploadAudio}
              disabled={isUploading}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 h-10 px-4 py-2"
            >
              {isUploading ? "Subiendo..." : "Subir Audio"}
            </button>
          )}
        </div>
      </div>
      <ResultDisplay
        images={[]}
        resultType="text"
        text={message || "Sin resultados"}
      />
    </div>
  );
};

export default VoicePage;
