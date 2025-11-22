import { useState } from "react";

export default function UploadPanel({ onOCRComplete }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError("");
    }
  }

  function clearFile() {
    setPreview(null);
    setFile(null);
    setFileInputKey(Date.now());
    setError("");
  }

  async function handleUpload() {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/ocr-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("OCR upload failed.");
      }

      const data = await res.json();
      // The backend will return: { text: "...extracted text..." }

      if (onOCRComplete) {
        onOCRComplete(data.text);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to upload or process the image.");
    }

    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      
      {/* Mini Header */}
      <div className="bg-red-800 text-white px-4 py-3">
        <h2 className="text-lg font-semibold">Upload Course Image</h2>
      </div>

      {/* Card Body */}
      <div className="p-6 flex items-start gap-4">

        {/* Left Column: Choose + Upload */}
        <div className="flex flex-col gap-3 w-1/2">

          {/* Hidden file input */}
          <input
            key={fileInputKey}
            type="file"
            id="fileInput"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          {/* Choose File */}
          <button
            onClick={() => document.getElementById("fileInput").click()}
            className="bg-gray-300 text-black font-medium px-4 py-2 shadow hover:bg-gray-400"
          >
            Choose File
          </button>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`px-4 py-2 font-medium shadow 
              ${loading ? "bg-gray-400" : "bg-gray-300 hover:bg-gray-400"} 
              text-black`}
          >
            {loading ? "Processing..." : "Upload"}
          </button>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Right Column: Image Preview */}
        <div className="w-1/2 flex flex-col items-center">
          {preview ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={preview}
                alt="Preview"
                className="max-h-32 rounded border border-gray-400"
              />

              <button
                onClick={clearFile}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Remove file
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No file selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
