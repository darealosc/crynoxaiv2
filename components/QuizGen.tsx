import React, { useState } from "react";
import { FileText } from "lucide-react";


export default function QuizGen() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<string[]>([]);

    const handleGenerate = async () => {
        setLoading(true);
        const response = await fetch("/api/quizgen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: input }),
        });
        const data = await response.json();
        setQuestions(data.questions || []);
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-neutral-900 rounded-md flex flex-col gap-4 items-center">
            <FileText className="w-10 h-10 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Quiz Generator</h2>
            <textarea
                className="w-full h-20 p-2 rounded-md bg-neutral-800 text-white"
                placeholder="Enter topic, notes, or text..."
                value={input}
                onChange={e => setInput(e.target.value)}
            />
            <button
                onClick={handleGenerate}
                disabled={loading || !input.trim()}
                className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all disabled:opacity-50"
            >
                {loading ? "Generating..." : "Generate Quiz"}
            </button>
            {questions.length > 0 && (
                <div className="w-full mt-4 flex flex-col gap-2">
                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-neutral-800 rounded-md p-3 text-white">
                            {q}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}