import { useState } from "react";

export default function CourseSelector({ courses = [], onCoursesSelected }) {
  const [selected, setSelected] = useState([]);

  // Remove duplicates
  const uniqueCourses = [...new Set(courses)];

  function toggleCourse(code) {
    let updated;

    if (selected.includes(code)) {
      updated = selected.filter((c) => c !== code);
    } else {
      if (selected.length >= 5) return;
      updated = [...selected, code];
    }

    setSelected(updated);
  }

  // Button pushes selected list upward
  function sendToApp() {
    onCoursesSelected(selected);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">

      <div className="bg-red-800 text-white px-5 py-3">
        <h2 className="text-lg font-semibold tracking-wide">
          Select Courses (max 5)
        </h2>
      </div>

      <div className="p-6 max-h-80 overflow-y-auto">
        {uniqueCourses.length === 0 ? (
          <p className="text-gray-600">
            Courses will appear here after uploading your course image.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {uniqueCourses.map((code) => (
              <label
                key={code}
                className="flex items-center gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition rounded-md px-3 py-2 border border-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(code)}
                  onChange={() => toggleCourse(code)}
                  className="h-4 w-4 accent-red-700"
                />
                <span className="text-black font-medium">{code}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* RESTORED BUTTON */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={sendToApp}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2 rounded-md"
        >
          Confirm Selected Courses
        </button>
      </div>
    </div>
  );
}
