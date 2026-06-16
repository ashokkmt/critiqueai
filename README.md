# Critique AI

**Critique AI** is an intelligent answer evaluation tool designed for students. It offers instant grading, feedback, note generation, roadmap creation, and multi-file summarization — all powered by Gemini AI and Supabase.

## Demo

[Visit Critique AI →](https://critiqueai00.vercel.app)

## Features

- **Instant Grading**
  Upload answers and receive quick scores, feedback, and improvement tips.

- **Note Generation**
  Create clear, structured notes from any content. Users can also provide custom instructions.

- **Roadmap Creation**
  Just enter a topic, and get a complete learning roadmap — no extra input needed.

- **Multi-File Summarization**
  Supports multiple files like PDF, DOCX, TXT, JPG, PNG, and JPEG for summarization in one go.

- **Deep File Analysis**
  Custom Python engine extracts text, images (described using Gemini), and tables from PDFs.

- **Secure & Clean Workflow**
  Built on Supabase for auth, database, and storage. Files are auto-deleted after processing.

## Project Structure

```
critiqueai/
├── frontend/    # React (Vite) app
├── backend/     # Flask API server
└── README.md
```

## Quick Start

### Local Development

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend (using uv):**

Install uv if you don't have it:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Set up and run the backend:
```bash
cd backend
uv sync
uv run python app.py
```

### Environment Variables

**Frontend (`frontend/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

**Backend (`backend/.env`)**

| Variable | Description |
|---|---|
| `GEN_API2` | Google Generative AI API key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key |
| `CORS_ORIGINS` | Comma-separated allowed origins |

## Supported File Formats

`.pdf`, `.docx`, `.txt`, `.jpg`, `.jpeg`, `.png`

## How It Works

1. Users provide text or upload files.
2. Text is directly sent to Gemini for processing.
3. Uploaded files are temporarily stored in Supabase Storage.
4. Each file's data is extracted into text using a custom Python engine.
5. Extracted text is passed to Gemini AI for summarization, evaluation, or note-making.
6. Output is shown to the user instantly.
7. Uploaded files are deleted after use.

## Custom PDF Handler

Since AI models can't directly read or interpret PDFs properly, a custom Python function was developed to:

- Extract text, images, and tables from PDFs page-by-page
- Describe images using Gemini
- Format everything into clean, structured JSON
- Pass it to Gemini for smart processing

This enables rich analysis of academic documents and handwritten notes.

## Future Plans

- Fine-tune a custom AI model for smarter evaluations
- Improve file processing speed
- Support more file types

## Problem It Solves

> Students need quick feedback, but grading takes time.
> **Critique AI** automates the entire evaluation process — giving instant scores, feedback, notes, and summaries — making learning easier and faster.

## License

MIT
