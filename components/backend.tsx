"use client";
import React, { useState } from "react";
import axios from "axios";

interface Message {
  id: number;
  type: "user" | "bot";
  text?: string;
  file?: File;
  imageUrl?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const sendMessage = async () => {
    if (!input && files.length === 0) return;

    const newMsg: Message = {
      id: Date.now(),
      type: "user",
      text: input,
      file: files[0],
      imageUrl: files[0] && files[0].type.startsWith("image/")
        ? URL.createObjectURL(files[0])
        : undefined,
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      const res = await axios.post("http://localhost:3001/generate", {
        prompt: input,
      });

      const botMsg: Message = {
        id: Date.now() + 1,
        type: "bot",
        text: res.data?.response?.response ?? "No response",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "bot", text: "Error: " + String(err) },
      ]);
    }

    setInput("");
    setFiles([]);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-3">
        <button className="bg-zinc-700 px-3 py-1 rounded-lg w-full mb-2">
          + New Chat
        </button>
        <div className="text-sm text-zinc-400">Chats will go here...</div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl max-w-lg ${
                msg.type === "user"
                  ? "bg-blue-600 self-end"
                  : "bg-zinc-800 self-start"
              }`}
            >
              {msg.text && <p>{msg.text}</p>}
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="preview"
                  className="mt-2 max-h-48 rounded-xl"
                />
              )}
              {msg.file && !msg.imageUrl && (
                <p className="mt-2 text-sm italic">{msg.file.name}</p>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 p-3 border-t border-zinc-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-lg bg-zinc-900 border border-zinc-700"
          />
          <input
            type="file"
            onChange={(e) => e.target.files && setFiles([e.target.files[0]])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="bg-zinc-700 px-3 py-2 rounded-lg cursor-pointer"
          >
            📎
          </label>
          <button
            onClick={sendMessage}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
