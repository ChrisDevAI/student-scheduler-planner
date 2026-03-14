// App.jsx

import { useState, useEffect } from 'react'
import UploadPanel from './components/UploadPanel'
import CourseSelector from './components/CourseSelector'
import ChatPanel from './components/ChatPanel'
import AppHeader from './components/AppHeader'

export default function App() {
  const [ocrText, setOcrText] = useState('')
  const [courseList, setCourseList] = useState([])
  const [selectedCourses, setSelectedCourses] = useState([])
  const [messages, setMessages] = useState([])

  const [processingCourses, setProcessingCourses] = useState(false)
  const [assistantTyping, setAssistantTyping] = useState(false)

  function addAssistantMessage(text) {
    setMessages((prev) => [...prev, { sender: 'assistant', text }])
  }

  useEffect(() => {
    if (!ocrText) return

    async function extract() {
      setProcessingCourses(true)

      try {
        const res = await fetch('http://localhost:8000/extract-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: ocrText }),
        })

        const data = await res.json()
        setCourseList(data.courses || [])
      } catch (err) {
        console.error('Extraction failed:', err)
      }

      setProcessingCourses(false)
    }

    extract()
  }, [ocrText])

  async function handleSendMessage(userMessage) {
    if (!userMessage.trim()) return

    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }])
    setAssistantTyping(true)

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          selected_courses: selectedCourses,
        }),
      })

      const data = await res.json()

      setAssistantTyping(false)
      setMessages((prev) => [...prev, { sender: 'assistant', text: data.reply }])
    } catch (err) {
      console.error('Chat error:', err)
      setAssistantTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppHeader />

      <div className="w-full mt-6 flex gap-8 px-4">
        <div className="flex-none w-[360px]">
          <UploadPanel onOCRComplete={setOcrText} />
        </div>

        <div className="flex-grow">
          <CourseSelector
            courses={courseList}
            processing={processingCourses}
            onCoursesSelected={(selected) => {
              setSelectedCourses(selected)

              if (selected.length > 0) {
                const formatted = selected.join(', ')
                addAssistantMessage(
                  `I’ve received your selected courses: ${formatted}.\nLet me know your scheduling preferences.`
                )
              }
            }}
          />
        </div>
      </div>

      <div className="w-full mt-8 px-4">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          assistantTyping={assistantTyping}
        />
      </div>
    </div>
  )
}
