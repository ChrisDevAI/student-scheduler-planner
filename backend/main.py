# main.py

import os
import csv
import json
import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from openai import OpenAI

from dotenv import load_dotenv
from settings import LLM_MODEL, LLM_TEMPERATURE
from ocr import extract_text_from_bytes
from scheduler import build_conflict_free_schedule

# ====================================================
# ENV
# ====================================================
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ====================================================
# FASTAPI
# ====================================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================================================
# CSV LOAD
# ====================================================
COURSES_DB = []
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "courses.csv")

with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        COURSES_DB.append({
            "course_code": row["course_code"].strip().upper(),
            "course_name": row["course_name"],
            "section": row["section"],
            "days": row["days"],
            "time": row["time"]
        })

VALID_COURSE_CODES = {row["course_code"] for row in COURSES_DB}

# ====================================================
# MODELS
# ====================================================
class ExtractRequest(BaseModel):
    text: str


class ScheduleRequest(BaseModel):
    selected_courses: List[str]

# ====================================================
# HELPERS
# ====================================================
def build_fallback_explanation(schedule: List[dict]) -> str:
    if not schedule:
        return "A conflict-free schedule was created successfully."

    lines = ["Your conflict-free schedule has been created successfully."]
    lines.append("Here are your selected sections:")

    for course in schedule:
        lines.append(
            f"- {course['course_code']} ({course['course_name']}), "
            f"Section {course['section']}, "
            f"{course['days']} at {course['time']}."
        )

    lines.append("The explanation service is temporarily unavailable, but your schedule was built successfully.")
    return "\n".join(lines)

# ====================================================
# OCR UPLOAD
# ====================================================
@app.post("/ocr-upload")
async def ocr_upload(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        extracted_text = extract_text_from_bytes(contents)
        return {"text": extracted_text}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================================================
# COURSE EXTRACTION (DETERMINISTIC)
# ====================================================
@app.post("/extract-courses")
async def extract_courses(req: ExtractRequest):
    try:
        normalized_text = req.text.upper()

        # Match patterns like ENC1101, MAC1105, COP2800
        matches = re.findall(r"\b[A-Z]{3}\d{4}\b", normalized_text)

        # Deduplicate + filter against actual synthetic database
        unique_matches = sorted(set(matches))
        valid_matches = [code for code in unique_matches if code in VALID_COURSE_CODES]

        return {"courses": valid_matches}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Course extraction failed: {str(e)}")

# ====================================================
# BUILD SCHEDULE (DETERMINISTIC + LLM EXPLANATION)
# ====================================================
@app.post("/build-schedule")
async def build_schedule(req: ScheduleRequest):
    if not req.selected_courses:
        raise HTTPException(status_code=400, detail="No courses were selected.")

    try:
        normalized_selected = [code.strip().upper() for code in req.selected_courses]
        final_schedule = build_conflict_free_schedule(normalized_selected, COURSES_DB)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduler failed: {str(e)}")

    explanation = ""
    explanation_source = "llm"

    try:
        explanation_prompt = f"""
You are a helpful scheduling assistant.

A deterministic scheduling algorithm has already constructed this conflict-free student schedule.
Do not change it. Do not suggest alternatives. Do not invent sections.

Selected course codes:
{normalized_selected}

Final schedule:
{json.dumps(final_schedule, indent=2)}

Explain the final schedule in plain English for the student.
Keep it clear, concise, and friendly.
"""

        completion = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": explanation_prompt}],
            temperature=LLM_TEMPERATURE
        )

        explanation = completion.choices[0].message.content

        if not explanation or not explanation.strip():
            explanation = build_fallback_explanation(final_schedule)
            explanation_source = "fallback"

    except Exception:
        explanation = build_fallback_explanation(final_schedule)
        explanation_source = "fallback"

    return {
        "selected_courses": normalized_selected,
        "schedule": final_schedule,
        "explanation": explanation,
        "explanation_source": explanation_source
    }
