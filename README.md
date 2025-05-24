# 📚 Critique AI

**Critique AI** is an intelligent answer evaluation tool designed for students. It offers instant grading, feedback, note generation,  roadmap creation, and multi-file summarization — all powered by Gemini AI and Google Cloud services.


## 🔗 Project Link

🌐 [Visit Critique AI →](https://critiqueai.dev)

## 🚀 Features

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
  Built on GCP with services like Cloud Run, Firebase Storage, Firestore, Vision API, and Secret Manager. Files are auto-deleted after processing.



## 📂 Supported File Formats

- `.pdf, .docx, .txt, .jpg, .jpeg, .png`



## 🧠 How It Works

1. Users provide text or upload files.
2. Text is directly sent to Gemini for processing.
3. Uploaded files are temporarily stored in Firebase Storage.
4. Each file data get extracted using functions into text.
5. Extracted text is passed to Gemini AI for summarization, evaluation, or note-making.
6. Output is shown to the user instantly.
7. Uploaded files are deleted after use; logs are saved in Firestore.



## 🧩 Custom PDF Handler

Since AI models can't directly read or interpret PDFs properly, a custom Python function was developed to:

- Extract text, images, and tables from PDFs page-by-page
- Describe images using Gemini
- Format everything into clean, structured JSON
- Pass it to Gemini for smart processing

This enables rich analysis of academic documents and handwritten notes.



## 🌱 Future Plans

- Fine-tune a custom AI model for smarter evaluations
- Improve file processing speed
- Add login system to store and view past results
- Support more file types



## 🎯 Problem It Solves

> Students need quick feedback, but grading takes time.  
> **Critique AI** automates the entire evaluation process — giving instant scores, feedback, notes, and summaries — making learning easier and faster.

