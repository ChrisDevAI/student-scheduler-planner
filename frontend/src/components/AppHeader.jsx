// AppHeader.jsx

import campusLogo from '../assets/campus.svg'

export default function AppHeader() {
  return (
    <div className="w-full bg-red-800 py-6 flex justify-center">
      <div className="flex items-center gap-4">
        <img src={campusLogo} alt="Campus" className="w-12 h-12" />
        <h1 className="text-3xl font-bold text-white">Student Schedule Planner</h1>
      </div>
    </div>
  )
}
