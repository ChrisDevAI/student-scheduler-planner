# Student Schedule Planner   (MVP Release)

![Hero Screenshot](screenshots/hero.jpg)

An AI-powered system that converts a photo of your course list into a personalized class schedule using computer vision, AI, and database section matching.


## 🔴 Live Demo (Frontend Only)  - MVP Release
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

The Student Schedule Planner is an MVP full-stack application that demonstrates a professional AI-assisted pipeline with deterministic business logic.

The system works as follows:

A student uploads an image of a course list

OCR extracts raw text from the image

Deterministic pattern matching extracts valid course codes

The student selects which courses they want to take

A deterministic scheduling algorithm builds a conflict-free schedule using a synthetic CSV course database

An LLM optionally explains the final schedule in plain English

If the LLM is unavailable, the system falls back gracefully and still returns the completed schedule

This architecture intentionally reserves the LLM for explanation only, while keeping extraction, validation, and schedule generation deterministic and auditable.

---

## Features

### Image Upload + OCR
- Upload JPG/PNG course list images  
- FastAPI backend receives file bytes  
- Tesseract OCR processes text (`ocr.py`)  
- Clean, modular OCR pipeline

### Deterministic Course Extraction
- Extracts course codes using regex pattern matching
- Filters extracted codes against the synthetic course catalog
- Deduplicates and normalizes valid course codes
- No LLM dependency for course-code extraction

### Course Selection UI
- Select up to 5 courses  
- Responsive React + Tailwind UI 
- Loading + confirmation states  
- Clean component-based frontend structure

### Deterministic Schedule Generation
- Uses a synthetic CSV dataset of course sections
- Selects one section per chosen course
- Detects and avoids time conflicts
- Returns the first valid conflict-free schedule

### LLM Explanation Layer
- The final schedule can be explained in plain English by an LLM
- The LLM does not build the schedule
- If the explanation service is unavailable, the app falls back and still returns the schedule successfully
 
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
- OpenAI API
- Deterministic scheduling engine
- CSV-based synthetic course database


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

## Why This Project Matters
This project demonstrates more than just full-stack integration.
It shows the ability to:
- design an end-to-end pipeline
- separate deterministic logic from LLM responsibilities
- build resilient backend workflows
- recover gracefully from external service failures
- structure an MVP around correctness, maintainability, and explainability


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







