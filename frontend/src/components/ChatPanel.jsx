import { useState, useRef, useEffect } from "react";

export default function ChatPanel({ messages = [], onSendMessage }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;

    onSendMessage(input);
    setInput("");
  }

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-6">
      
      <div className="bg-red-800 text-white rounded-xl px-4 py-3">
        <h2 className="text-xl font-semibold mb-4 text-white">
        Chat with Assistant
        </h2>
    </div>  

      {/* Chat Window */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-red-700 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-3 mt-4">
        <input
          className="flex-1 border border-gray-300 p-3 rounded-lg"
          placeholder="Type your scheduling preferences..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className="bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
        >
          Send
        </button>
      </div>

    </div>
  );
}
