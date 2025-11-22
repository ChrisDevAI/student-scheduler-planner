import { useState, useEffect } from "react";
import UploadPanel from "./components/UploadPanel";
import CourseSelector from "./components/CourseSelector";
import ChatPanel from "./components/ChatPanel";
import campusLogo from "./assets/campus.svg";

export default function App() {
  const [ocrText, setOcrText] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!ocrText) return;

    async function extract() {
      try {
        const res = await fetch("http://localhost:8000/extract-courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: ocrText })
        });

        const data = await res.json();
        setCourseList(data.courses || []);
      } catch (err) {
        console.error("Extraction failed:", err);
      }
    }

    extract();
  }, [ocrText]);

  async function handleSendMessage(userMessage) {
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          selected_courses: selectedCourses
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { sender: "assistant", text: data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">


      {/* FULL-WIDTH RED HEADER */}
      <div className="w-full bg-red-800 py-6 flex justify-center">
        <div className="flex items-center gap-4">
          <img src={campusLogo} alt="Campus" className="w-12 h-12" />
          <h1 className="text-3xl font-bold text-white">
            Student Schedule Planner
          </h1>
        </div>
      </div>
      

      {/* TOP ROW: 40% Upload, 60% Select */}
      <div className="w-full mt-6 flex gap-8 px-4">


        <div className="flex-none w-[360px]">

          <UploadPanel onOCRComplete={setOcrText} />
        </div>

        <div className="flex-grow">

          <CourseSelector
            courses={courseList}
            onCoursesSelected={setSelectedCourses}
          />
        </div>

      </div>

      {/* CHAT PANEL BELOW */}
      <div className="w-full mt-8 px-4">

        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>


      
    </div>
  );
}
