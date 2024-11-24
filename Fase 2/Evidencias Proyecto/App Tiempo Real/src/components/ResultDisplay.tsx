import { useEffect, useState } from "react";

interface ResultDisplayProps {
  images: any[];
  text: string;
  resultType: "image" | "text";
}

export default function ResultDisplay({ images = [], text, resultType }: ResultDisplayProps) {

  const [actualImage, setActualImage] = useState("");

  const iterateImages = () => {
    let i = 0;
    const _interval = setInterval(() => {
      if (i < images.length) {
        setActualImage(images[i]);
        i++;
      } else {
        setActualImage("/placeholder.svg");
        clearInterval(_interval);
      }
    }, 1000);
  }

  useEffect(() => {
    if (images.length > 0) {
      iterateImages();
    }
  }, [images]);

  return (
    <div className="w-64 bg-white rounded-lg shadow-md overflow-hidden">
      <h1 className="px-2 py-2 bg-neutral-100 font-semibold">Resultados:</h1>
      <div className="h-48 relative">
        {
          resultType == "image" && (
            <img
              src={actualImage || '/placeholder.svg'}
              alt="Resultado"
              className="object-contain w-full h-full"
            />
          )
        }
      </div>
        {
          resultType == "text" && (
            <div className="p-4">
              <p className="text-sm">{text}</p>
            </div>
          )
        }
    </div>
  )
}