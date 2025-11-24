# Student Schedule Planner

![Hero Screenshot](screenshots/hero.jpg)

An AI-powered system that converts a photo of your course list into a personalized class schedule using computer vision, AI, and database section matching.


## 🔴 Live Demo (Frontend Only)
https://student-schedule-planner-75ce2.web.app/

> Backend functionality requires running locally.

---

## Installation (Quick Start)

Python version: 3.10.x

Clone the repo:

```bash
git clone https://github.com/ChrisDevAI/student-schedule-planner.git
cd student-schedule-planner
```

### Backend

```bash
cd backend
py 3.10 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A sample test image is located at:

```
frontend/public/test-image.jpg
```

---

## Overview
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Development Journey](#development-journey)
- [License](#license)
- [Author](#author)

---

## Features

### Image Upload + OCR
- Upload JPG/PNG course list images  
- FastAPI backend receives file bytes  
- Tesseract OCR processes text (`ocr.py`)  
- Clean, modular OCR pipeline  

### LLM Assistant
- gpt-4o-mini  
- Validates course codes  
- Deduplicates and normalizes results  

### Course Selection UI
- Select up to 5 courses  
- Responsive Tailwind interface  
- Loading + confirmation states  
- Clean React component structure  

### AI Chat Assistant
- Built-in chat window  
- Assistant typing animation  
- CSV-based section matching  
- Local backend required for full functionality
 
[⬆️ Back to Overview](#overview)


---

## Tech Stack

### Frontend  
- React  
- Vite  
- TailwindCSS  

### Backend  
- Python  
- FastAPI  
- Tesseract OCR  
- OpenAI gpt-4o-mini  

[⬆️ Back to Overview](#overview)

---

## Development Journey

### Story 1 — Early Prototype  
![Early Prototype](screenshots/story1.jpg)

### Story 2 — OCR + Extraction Working  
![OCR Working](screenshots/story2.jpg)

### Story 3 — First LLM Schedule Output  
![Schedule Output](screenshots/story3.jpg)

### Story 4 — Pre-Final UI  
![Pre-Final UI](screenshots/story4.jpg)


[⬆️ Back to Overview](#overview)

---

## License
MIT License

---

## Author

**Christopher Mena**  
AI/ML Engineer  
GitHub: https://github.com/ChrisDevAI  
Website: https://ChrisAI.dev  
LinkedIn: https://linkedin.com/in/ChrisDevAI






