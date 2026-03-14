// App.jsx

import { useState, useEffect } from 'react'
import UploadPanel from './components/UploadPanel'
import CourseSelector from './components/CourseSelector'
import ChatPanel from './components/ChatPanel'
import AppHeader from './components/AppHeader'

export default function App() {
  const [ocrText, setOcrText] = useState('')
  const [courseList, setCourseList] = useState([])
  const [messages, setMessages] = useState([])
  const [processingCourses, setProcessingCourses] = useState(false)
  const [assistantTyping, setAssistantTyping] = useState(false)

  function addAssistantMessage(text) {
    setMessages((prev) => [...prev, { sender: 'assistant', text }])
  }

  function addUserMessage(text) {
    setMessages((prev) => [...prev, { sender: 'user', text }])
  }

  useEffect(() => {
    if (!ocrText) return

    async function extractCourses() {
      setMessages([])
      setCourseList([])
      setAssistantTyping(false)
      setProcessingCourses(true)

      try {
        const res = await fetch('http://localhost:8000/extract-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: ocrText }),
        })

        if (!res.ok) {
          throw new Error('Course extraction failed.')
        }

        const data = await res.json()
        const extractedCourses = data.courses || []

        setCourseList(extractedCourses)

        if (extractedCourses.length === 0) {
          addAssistantMessage('I could not detect any valid course codes from the uploaded image.')
        }
      } catch (err) {
        console.error('Extraction failed:', err)
        addAssistantMessage('There was a problem extracting course codes from the uploaded image.')
      } finally {
        setProcessingCourses(false)
      }
    }

    extractCourses()
  }, [ocrText])

  async function handleCoursesSelected(selected) {
    if (!selected || selected.length === 0) {
      return
    }

    const formatted = selected.join(', ')
    addUserMessage(`Selected courses: ${formatted}`)
    setAssistantTyping(true)

    try {
      const res = await fetch('http://localhost:8000/build-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_courses: selected,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to build schedule.')
      }

      const scheduleText = (data.schedule || [])
        .map(
          (course) =>
            `${course.course_code} - ${course.course_name}\nSection ${course.section} | ${course.days} | ${course.time}`
        )
        .join('\n\n')

      const combinedMessage = `Here is your conflict-free schedule:\n\n${scheduleText}\n\n${data.explanation}`

      addAssistantMessage(combinedMessage)
    } catch (err) {
      console.error('Schedule build error:', err)
      addAssistantMessage(
        typeof err.message === 'string' ? err.message : 'Failed to build a conflict-free schedule.'
      )
    } finally {
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
            onCoursesSelected={handleCoursesSelected}
          />
        </div>
      </div>

      <div className="w-full mt-8 px-4">
        <ChatPanel messages={messages} assistantTyping={assistantTyping} />
      </div>
    </div>
  )
}
