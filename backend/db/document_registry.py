"""
document_registry.py  —  Persistent SQLite store for all uploaded documents.
Stores file name, subject, unit, topic, difficulty, marks_weightage,
upload timestamp, and source type (file / youtube).
Uses Python's built-in sqlite3 — no extra dependencies.
"""
import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "documents.db")

def _get_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=15.0, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.row_factory = sqlite3.Row          # lets us return dict-like rows
    return conn


def _init_db():
    """Create the documents table if it does not exist."""
    conn = _get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            source_type TEXT    NOT NULL DEFAULT 'file',   -- 'file' or 'youtube'
            subject     TEXT,
            unit        TEXT,
            topic       TEXT,
            difficulty  TEXT    DEFAULT 'medium',
            marks_weight INTEGER DEFAULT 0,
            chunks      INTEGER DEFAULT 0,
            uploaded_at TEXT    NOT NULL
        )
    """)
    conn.commit()
    conn.close()


# Initialise on import
_init_db()


# ─────────────────────────  Public API  ──────────────────────────────────────

class DocumentRegistry:
    def add_document(
        self,
        name: str,
        source_type: str,
        subject: str,
        unit: str,
        topic: str,
        difficulty: str = "medium",
        marks_weight: int = 0,
        chunks: int = 0,
    ) -> int:
        """Insert a new document record and return its row id."""
        conn = _get_connection()
        cur = conn.execute(
            """INSERT INTO documents
               (name, source_type, subject, unit, topic, difficulty, marks_weight, chunks, uploaded_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (name, source_type, subject, unit, topic, difficulty, marks_weight, chunks,
             datetime.now().isoformat(sep=" ", timespec="seconds")),
        )
        conn.commit()
        row_id = cur.lastrowid
        conn.close()
        return row_id  # type: ignore[return-value]

    def get_all(self) -> List[Dict[str, Any]]:
        """Return all documents ordered by most recent first."""
        conn = _get_connection()
        rows = conn.execute(
            "SELECT * FROM documents ORDER BY uploaded_at DESC"
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_by_subject(self, subject: str) -> List[Dict[str, Any]]:
        conn = _get_connection()
        rows = conn.execute(
            "SELECT * FROM documents WHERE subject = ? ORDER BY uploaded_at DESC",
            (subject,)
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def delete_document(self, doc_id: int) -> bool:
        conn = _get_connection()
        cur = conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
        deleted = cur.rowcount > 0
        conn.close()
        return deleted

    def search(self, query: str) -> List[Dict[str, Any]]:
        """Simple substring search across name / topic / subject."""
        like = f"%{query}%"
        conn = _get_connection()
        rows = conn.execute(
            """SELECT * FROM documents
               WHERE name LIKE ? OR topic LIKE ? OR subject LIKE ?
               ORDER BY uploaded_at DESC""",
            (like, like, like)
        ).fetchall()
        conn.close()
        return [dict(r) for r in rows]


document_registry = DocumentRegistry()
