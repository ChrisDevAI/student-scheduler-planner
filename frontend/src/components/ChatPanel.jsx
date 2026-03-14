// ChatPanel.jsx

import { useRef, useEffect } from 'react'

export default function ChatPanel({ messages = [], assistantTyping }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, assistantTyping])

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-red-800 text-white px-4 py-3">
        <h2 className="text-xl font-semibold">Schedule Results</h2>
      </div>

      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto border-t border-gray-200 p-4 bg-gray-50 space-y-4"
      >
        {messages.length === 0 && !assistantTyping && (
          <p className="text-gray-600">
            Your generated schedule and explanation will appear here after you select and confirm
            your courses.
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-3 rounded-lg max-w-2xl whitespace-pre-wrap leading-relaxed ${
                msg.sender === 'user' ? 'bg-red-700 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {assistantTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-black px-4 py-2 rounded-lg max-w-xs flex items-center gap-2">
              <span className="font-medium">Building schedule</span>
              <span className="typing-dots flex gap-1">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          .dot {
            width: 6px;
            height: 6px;
            background-color: black;
            border-radius: 50%;
            display: inline-block;
            opacity: 0.3;
            animation: blink 1.4s infinite both;
          }

          .dot:nth-child(1) {
            animation-delay: 0s;
          }

          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes blink {
            0% { opacity: 0.3; }
            20% { opacity: 1; }
            100% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  )
}
