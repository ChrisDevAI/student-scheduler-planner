import os
import io
import csv
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from openai import OpenAI

from dotenv import load_dotenv
from ocr import extract_text_from_bytes   # <-- modular OCR import

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
            "course_code": row["course_code"],
            "course_name": row["course_name"],
            "section": row["section"],
            "days": row["days"],
            "time": row["time"]
        })

# ====================================================
# MODELS
# ====================================================
class ExtractRequest(BaseModel):
    text: str

class ScheduleRequest(BaseModel):
    selected_courses: List[str]
    preferences: str

class ChatRequest(BaseModel):
    message: str
    selected_courses: List[str]

# ====================================================
# HELPERS
# ====================================================
def get_sections_for_codes(codes: List[str]):
    mapping = {c: [] for c in codes}
    for row in COURSES_DB:
        if row["course_code"] in mapping:
            mapping[row["course_code"]].append(row)
    return mapping

# ====================================================
# OCR UPLOAD  (now modular + clean)
# ====================================================
@app.post("/ocr-upload")
async def ocr_upload(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Use modular OCR function
        extracted_text = extract_text_from_bytes(contents)

        return {"text": extracted_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================================================
# COURSE EXTRACTION
# ====================================================
@app.post("/extract-courses")
async def extract_courses(req: ExtractRequest):
    prompt = f"""
Extract valid course codes from this text.
Format: 3 letters + 4 digits (ENC1101, MAC1105, COP2800)

Text:
{req.text}

Return ONLY a JSON array, no explanation, no text around it.
Example:
["ENC1101","MAC1105"]
"""

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    raw = completion.choices[0].message.content
    print("RAW LLM OUTPUT:", raw)

    # 1. Strip markdown code fences if present
    raw = raw.replace("```json", "").replace("```", "").strip()

    # 2. Try normal JSON parse
    try:
        return {"courses": json.loads(raw)}
    except:
        pass

    # 3. Fallback: extract JSON array with regex
    import re
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if match:
        try:
            return {"courses": json.loads(match.group(0))}
        except:
            pass

    # 4. Final fallback
    return {"courses": []}


# ====================================================
# CHAT ENDPOINT  (powers ChatPanel)
# ====================================================
@app.post("/chat")
async def chat(req: ChatRequest):
    sections = get_sections_for_codes(req.selected_courses)

    prompt = f"""
You are a scheduling assistant embedded in a student's app.

Selected courses:
{req.selected_courses}

Matching CSV sections:
{sections}

User message:
"{req.message}"

Respond as a helpful chat assistant.
"""

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )

    reply = completion.choices[0].message.content
    return {"reply": reply}
