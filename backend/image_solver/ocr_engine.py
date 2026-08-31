import pytesseract
from PIL import Image
import io

class OCREngine:
    def extract_math_from_image(self, image_bytes: bytes) -> str:
        """Extracts text/math equations from an uploaded image."""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Assuming pytesseract is installed in the system PATH
            # For Windows, sometimes you need pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            raise ValueError(f"OCR failed to parse the image: {e}")

ocr_engine = OCREngine()
