import { useEffect, useState, useMemo } from "react";
import WordInfo from "./WordInfo";

interface WordWrapperProps {
  _words: string[];
  wordsKeys: string[];
}

export default function WordWrapper({ _words, wordsKeys }: WordWrapperProps) {

    const [keyFilter, setKeyFilter] = useState<string>("A");
    const [wordFilter, setWordFilter] = useState<string>("");

    const filteredWords = useMemo(() => {
        return _words.filter((word: any) => {
            const wordText = word.text[0].toLowerCase();
            const filter = wordFilter.toLowerCase();
            const key = keyFilter.toLowerCase();

            const matchesWord = wordText.includes(filter);
            const matchesKey = wordText.startsWith(key);

            if (keyFilter !== "") {
                return matchesKey && (wordFilter === "" || matchesWord);
            }
            return wordFilter === "" || matchesWord;
        });
    }, [wordFilter, keyFilter, _words]);

    return (
        <main className="container mx-auto px-4 py-8">
            <input onChange={(e) => setWordFilter(e.target.value)} value={wordFilter} className="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-4 bg-neutral-800 border-neutral-700 text-neutral-300" placeholder="Buscar palabra..." type="search" />
            <section className="grid grid-flow-col gap-x-2 overflow-x-auto py-2">
                {
                    wordsKeys.map((letter: string) => (
                        <button onClick={() => setKeyFilter(keyFilter != letter ? letter : '')} key={letter} className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground px-4 py-2.5 text-sm ${ keyFilter == letter ? 'bg-neutral-700' : 'bg-neutral-800' } hover:bg-neutral-700 text-white border-neutral-700 cursor-pointer`}>
                            {letter}
                        </button>
                    ))
                }
            </section>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 my-8">
                {filteredWords.map((word: any, index) => (
                    <WordInfo word={word} key={index} />
                ))}
            </div>
        </main>
    );
}