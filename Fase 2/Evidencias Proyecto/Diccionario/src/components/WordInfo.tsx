import { useEffect, useState, useMemo } from "react";

interface WordProps {
  word: any;
}

export default function WordWrapper({ word }: WordProps) {
    return (
        <main className="rounded-md text-card-foreground shadow-sm bg-neutral-900 border border-neutral-950/25 py-2">
            <img loading="lazy" alt="Hola" className="w-full h-32 object-contain mb-2 rounded-md" src={word.images[0]} />
            <div className="flex flex-col items-center justify-center">
                <h3 className="font-semibold tracking-tight mb-2">
                    {word.text[0]}
                </h3>
                {/*
                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md py-2 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-900 transition-all cursor-pointer w-4/5 text-xs">
                    Más detalles
                </div>
                */}
            </div>
        </main>
    );
}