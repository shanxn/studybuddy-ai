import os
from pathlib import Path
from pypdf import PdfReader
import docx2txt
import pytesseract
from PIL import Image
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from youtube_transcript_api import YouTubeTranscriptApi

class DocumentProcessor:
    def __init__(self, chunk_size: int = 400, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ".", " ", ""]
        )

    def process_file(self, file_path: str, metadata: dict) -> list[Document]:
        """Reads a file, extracts text, and chunks it into Documents."""
        ext = Path(file_path).suffix.lower()
        text = ""
        
        if ext == ".pdf":
            text = self._extract_pdf(file_path)
        elif ext == ".docx":
            text = self._extract_docx(file_path)
        elif ext == ".txt":
            text = self._extract_txt(file_path)
        elif ext in [".png", ".jpg", ".jpeg"]:
            text = self._extract_image(file_path)
        elif file_path.startswith("youtube:"):
            text = self._extract_youtube(file_path.split("youtube:")[1])
            ext = ".youtube"
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
            
        chunks = self.text_splitter.split_text(text)
        
        # Add source information to metadata
        metadata["source"] = os.path.basename(file_path)
        metadata["source_type"] = ext.replace(".", "").upper()
            
        return [Document(page_content=chunk, metadata=metadata.copy()) for chunk in chunks]

    def _extract_pdf(self, file_path: str) -> str:
        reader = PdfReader(file_path)
        pages: list[str] = []
        for page in reader.pages:  # type: ignore[union-attr]
            page_text = page.extract_text()  # type: ignore[union-attr]
            if page_text:
                pages.append(str(page_text))
        return "\n".join(pages)

    def _extract_docx(self, file_path: str) -> str:
        return docx2txt.process(file_path)

    def _extract_txt(self, file_path: str) -> str:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    def _extract_image(self, file_path: str) -> str:
        # Requires Tesseract installed on system
        try:
            image = Image.open(file_path)
            # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            print(f"OCR Error processing {file_path}: {e}")
            return ""

    def _extract_youtube(self, video_id: str) -> str:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            return " ".join([t['text'] for t in transcript])
        except Exception as e:
            print(f"Error extracting YouTube transcript: {e}")
            raise ValueError(f"Could not extract transcript for video ID: {video_id}")

processor = DocumentProcessor()
