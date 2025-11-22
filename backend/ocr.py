import os
import io
from PIL import Image
import pytesseract
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

# Load Windows Tesseract path
pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")


def extract_text_from_bytes(image_bytes: bytes) -> str:
    """
    Accepts raw image bytes and returns extracted text.
    Raises RuntimeError if OCR fails.
    """
    try:
        # Convert raw bytes → image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Run OCR
        text = pytesseract.image_to_string(image)

        return text.strip()

    except Exception as e:
        raise RuntimeError(f"OCR failed: {str(e)}")
