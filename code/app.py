from flask import Flask, render_template, request, session, jsonify
import pymupdf
import pdfplumber
import os
import json
import docx
from odfdo import Document
import markdown
import requests
from werkzeug.utils import secure_filename
import google.generativeai as genai
from datetime import datetime, timezone, timedelta
from google.cloud import storage, vision, documentai_v1 as documentai
import PIL.Image
from PIL import Image
from io import BytesIO
import zipfile
import firebase_admin
from firebase_admin import credentials, storage, firestore
import uuid
from google.oauth2 import service_account  # Added import
import tempfile  # Added import
from dotenv import load_dotenv  # Added import
import io
import base64

# Load environment variables from .env file
load_dotenv()

# Configure the Google Generative AI API
genai.configure(api_key=os.getenv('GEN_API'))
model = genai.GenerativeModel("gemini-2.0-flash")

# Updated prompts for AI evaluation
EVALUATION_PROMPT = "Evaluate the following question and answer pair for accuracy and relevance. Provide a concise summary (max 60-70 words, human -like legal language but simple), justification for your evaluations, and suggest specific improvements. Do not include any introductory text."
SCORE_PROMPT = "Evaluate the following question and answer pair and give it a combined score out of 0 to 10. Just give one word score like 'Score: 7'. (Always give 0 if the answer is absolutely wrong)"

# Enhanced prompts for AI evaluation
NOTES_PROMPT = '''Provide detailed notes on the following topic:
- Include key concepts, principles, and subtopics .
- Provide hands-on exercises, projects, and challenges that reinforce the concepts learned.
- List the most effective books, courses, websites, and tools to master the topic. Each resource should be a clickable working link with a brief description (1-2 lines).
- Format the output in Markdown for easy readability. (Do not add any markdown word), max output is just 1000 so answer should be according to that limit.'''

SUMMARY_PROMPT = '''"Provide a concise summary of the given file, organized in bullet points and grouped by key topics. 
Focus solely on the summary, excluding any additional commentary or analysis. Use as many words as needed to accurately capture the content.
max token is 1000 so summarize the content accoridng to that ,(Do not add any markdown word)'''

# New prompt for roadmap generation
ROADMAP_PROMPT = '''Generate a structured and detailed roadmap for learning {topic}. The roadmap should be divided into logical sections covering in phase-wise manner and also weeks to cover all this in best way:
(Do not add any greetings like okay, sure, here it is. JUST PROVIDE ROADMAP)

Key Concepts – Explain foundational theories, principles, and subtopics in {topic} with at least 25-35 words per subtopic.
Practice Tasks – Provide hands-on exercises, projects, and challenges that reinforce the concepts learned. Each task should include clear instructions and expected outcomes.

(ADD RESOURCES AND BOOK AT THE END)
Best Resources – List the most effective books, courses, websites, and tools to master {topic}. Each resource should be a clickable working link. (ADD SOME DETAIL OF BEST RESOURCES IN 1-2 LINE ONLY)
Books – Include relevant books with their titles and authors for in-depth learning.
The output should be formatted in Markdown for easy readability.(Dont add any markdown word)'''

IMG_PROMPT = "Describe the content of the image extracted from the PDF."

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24)

cred = credentials.Certificate("code/firebase.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "instant-theater-449913-h4.firebasestorage.app"
})

bucket = storage.bucket()
db = firestore.client()

# Initialize GCS client
credentials = service_account.Credentials.from_service_account_file(
    'code/service-account.json')

# Initialize all Google Cloud clients with the same credentials
vision_client = vision.ImageAnnotatorClient(credentials=credentials)


# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'txt', 'pdf', 'docx', 'odt'}


# Function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to evaluate text content


def get_evaluation(text, is_file=False):
    if is_file:
        response = model.generate_content(
            [text, SUMMARY_PROMPT], generation_config=genai.GenerationConfig(
                max_output_tokens=1000,  # Set the token limit back to 1500
                temperature=0.5))
        content = response.candidates[0].content.parts[0].text if response.candidates else "No summary generated"
    else:
        response = model.generate_content(
            [text, NOTES_PROMPT], generation_config=genai.GenerationConfig(
                max_output_tokens=1000,  # Set the token limit back to 1500
                temperature=0.5))
        content = response.candidates[0].content.parts[0].text if response.candidates else "No response generated"

    return content


# Functions for evaluation page
def get_evaluate(text):
    response = model.generate_content(
        [text, EVALUATION_PROMPT], generation_config=genai.GenerationConfig(
            max_output_tokens=1000,
            temperature=0.5))
    score = model.generate_content(
        [text, SCORE_PROMPT], generation_config=genai.GenerationConfig(
            max_output_tokens=1000,
            temperature=0.5))
    return response, score

# Text File
def process_txt_file(content):
    return get_evaluate(content)

# PDF File
def process_pdf_file(pdf_bytes):
    doc_data = base64.standard_b64encode(pdf_bytes).decode("utf-8")
    print("hello")

    response = model.generate_content(
        [{'mime_type': 'application/pdf', 'data': doc_data}, EVALUATION_PROMPT], generation_config=genai.GenerationConfig(
            max_output_tokens=200,
            temperature=0.5,))
    score = model.generate_content(
        [{'mime_type': 'application/pdf', 'data': doc_data}, SCORE_PROMPT], generation_config=genai.GenerationConfig(
            max_output_tokens=200,
            temperature=0.5,))
    print("hello")
    return response, score

# Image File
def process_img_file(path):
    img_file = PIL.Image.open(path)
    return get_evaluate(img_file)


# Helper function to extract text from images
def describe_image_with_gemini(image, flag=False):
    """
    Process image using Gemini with proper encoding and fallback
    Returns: Gemini description (preferred) or Vision API analysis (fallback)
    """
    try:
        # Convert to RGB if needed (for JPEG compatibility)
        if image.mode in ('RGBA', 'P', 'LA'):
            image = image.convert('RGB')

        # Encode to base64
        img_base64 = encode_image(image)

        # Generate description with Gemini
        response = model.generate_content(
            contents=[
                {"text": IMG_PROMPT},
                {"inline_data": {
                    "mime_type": "image/png",
                    "data": img_base64
                }}
            ],
            generation_config={
                "temperature": 0.3,
                "max_output_tokens": 1000
            }
        )

        # Return formatted response
        if response.candidates:
            return response.text.strip()
        return "No description generated"

    except Exception as e:
        print(f"Gemini Error: {str(e)} - Falling back to Vision API")
        # Fallback to Vision API processing
        try:
            image = vision.Image(content=image)
            text_response = vision_client.text_detection(image=image)
            labels_response = vision_client.label_detection(image=image)

            text = text_response.text_annotations[0].description if text_response.text_annotations else ""
            labels = [
                label.description for label in labels_response.label_annotations]

            return f"Vision API Analysis:\nText: {text}\nObjects: {', '.join(labels)}"

        except Exception as vision_error:
            return f"Both Gemini and Vision API failed: {str(vision_error)}"


# Modified image processing function
def process_img_file(content):
    try:
        description = describe_image_with_gemini(content, True)
        return get_evaluate(description)
    except Exception as e:
        # Mock response object
        error_response = type(
            'obj', (object,), {'text': f"Image Error: {str(e)}"})
        # Default error score
        error_score = type('obj', (object,), {'text': "Score: 0"})
        return error_response, error_score

# Helper function to extract text from PDF files


def encode_image(image):
    """Convert PIL Image to Base64 format for Gemini."""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


def extract_images(pdf_file, page_index):
    """Extracts images from a PDF page with Gemini descriptions."""
    page = pdf_file.load_page(page_index)
    image_list = page.get_images(full=True)
    images = []

    for img_index, img in enumerate(image_list, start=1):
        try:
            xref = img[0]
            base_image = pdf_file.extract_image(xref)
            image_bytes = base_image["image"]  # Raw bytes
            image_ext = base_image["ext"]
            image_name = f"image_{page_index+1}_{img_index}.{image_ext}"

            image = Image.open(io.BytesIO(image_bytes))

            # Generate description using Gemini with raw bytes
            image_description = describe_image_with_gemini(image)

            images.append({
                "name": image_name,
                "description": image_description
            })
        except Exception as e:
            images.append(f"[Image extraction error: {str(e)}]")
    return images


def extract_text(pdf_file, page_index):
    """Extracts text from a given PDF page."""
    page = pdf_file.load_page(page_index)
    return page.get_text("text")


def extract_tables(content, page_index):
    """Extracts tables using pdfplumber."""
    tables = []
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            if page_index < len(pdf.pages):
                page = pdf.pages[page_index]
                extracted_tables = page.extract_tables()
            for table_index, table in enumerate(extracted_tables, start=1):
                tables.append({
                    "table_number": table_index,
                    "data": table
                })
    except Exception as e:
        tables.append(f"[Table error: {str(e)}]")
    return tables


def extract_pdf_content(pdf_bytes):
    """Extracts text, images, and tables from PDF bytes and returns as a string."""
    pdf_file = pymupdf.open(stream=pdf_bytes, filetype="pdf")  # Open from bytes
    extracted_data = []

    for page_index in range(len(pdf_file)):
        page_content = {
            "page_number": page_index + 1,
            "text": extract_text(pdf_file, page_index),
            "images": extract_images(pdf_file, page_index),
            # Directly pass bytes
            "tables": extract_tables(pdf_bytes, page_index)
        }
        extracted_data.append(page_content)

    json_filename = "output.json"
    with open(json_filename, "w", encoding="utf-8") as json_file:
        json.dump(extracted_data, json_file, indent=4, ensure_ascii=False)

    print(f"[+] Extraction complete. Data saved to {json_filename}")

    # Convert the extracted_data list to a string
    result = "PDF CONTENT BELOW HERE\n"
    for page in extracted_data:
        result += f"PAGE {page['page_number']}:\n"
        result += f"TEXT:\n{page['text']}\n"

        result += "IMAGES:\n"
        for img in page['images']:
            if isinstance(img, dict):
                result += f"- {img['name']}: {img['description']}\n"
            else:
                result += f"- {img}\n"  # Error message case
        result += "\n"

        result += "TABLES:\n"
        for table in page['tables']:
            if isinstance(table, dict):
                result += f"Table {table['table_number']}:\n"
                for row in table['data']:
                    result += f"{row}\n"
                result += "\n"
            else:
                result += f"- {table}\n"  # Error message case
        result += "----------------------------------------\n"

    with open("output.txt", "w+") as f:
        f.write(result)

    return result


# Function to read .docx files


def read_docx_file(docx_content):
    """Read the content of a DOCX file and return it as a string, including tables."""
    doc = docx.Document(BytesIO(docx_content))
    full_text = []

    for para in doc.paragraphs:
        full_text.append(para.text)

    for table in doc.tables:
        for row in table.rows:
            row_data = [cell.text for cell in row.cells]
            full_text.append('\t'.join(row_data))

    return '\n'.join(full_text)


def process_docx_file(content):
    try:
        # Extract regular text content
        text_content = read_docx_file(content)

        # Extract and process images
        image_texts = []
        with zipfile.ZipFile(BytesIO(content)) as zip_file:
            for file_info in zip_file.infolist():
                if file_info.filename.startswith('word/media/'):
                    image_data = zip_file.read(file_info)
                    try:
                        img_text = describe_image_with_gemini(image_data)
                        image_texts.append(img_text)
                    except Exception as e:
                        # Handle image processing errors silently or log them
                        pass

        # Combine all text elements
        combined_text = f"{text_content}\n{' '.join(image_texts)}"
        return get_evaluate(combined_text)

    except Exception as e:
        return f"DOCX Error: {str(e)}"


# Function to process .odt files
def process_odt_file(content):
    odt_file = Document(content)
    text_content = [
        para.text for para in odt_file.body.get_elements("//text:p")]

    odt_text = '\n'.join(text_content)
    return get_evaluate(odt_text)

# Function to upload file to Google Cloud Storage


def upload_files(file):
    session_id = session.get('session_id')
    unique_filename = f"{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    blob = bucket.blob(f"sessions/{session_id}/{unique_filename}")
    blob.upload_from_file(file)
    blob.make_public()
    url = f"gs://instant-theater-449913-h4.firebasestorage.app/sessions/{session_id}/{unique_filename}"

    print(session_id)
    print("file uploaded now updating db")

    db.collection("user_files").document(unique_filename).set({
        "session_id": session_id,
        "filename": unique_filename,
        "url": url,
        "uploaded_at": datetime.now(timezone.utc)
    })

# Function to get file content from Google Cloud Storage
def get_user_files(session_id):
    """Fetches gs:// URLs for a user from Firestore."""
    print("Getting gs_urls")
    docs = db.collection("user_files").where(
        "session_id", "==", session_id).stream()
    file_urls = []
    for doc in docs:
        file_url = doc.to_dict()["url"]
        print(file_url)
        file_urls.append(file_url)

    return file_urls

def read_file_from_gcs(gs_url):
    """Reads a file as bytes directly from Firebase Storage."""
    file_path = '/'.join(gs_url.split('/')[3:])
    print(file_path)
    blob = bucket.blob(file_path)
    return blob.download_as_bytes(), blob.name


def process_file(gs_url):
    """Processes a file based on its type (Text, PDF, DOCX, Image)."""
    file_bytes, filename = read_file_from_gcs(gs_url)
    file_ext = filename.split(".")[-1].lower()
    
    # Plain text files
    if file_ext in ["txt", "csv", "json"]:  
        return file_bytes.decode("utf-8")

    # PDF files (Text + Images)
    elif file_ext == "pdf": 
        final_extracted_content = extract_pdf_content(file_bytes)
        return final_extracted_content
    
    # Image processing
    elif file_ext in ["png", "jpg", "jpeg"]:
        return describe_image_with_gemini(file_bytes, True)
    
    
    elif filename.endswith('.odt'):
        odt_file = Document(file_bytes)
        text_content = [
            para.text for para in odt_file.body.get_elements("//text:p")]
        return '\n'.join(text_content)
    
    elif filename.endswith('.docx'):
        text_content = read_docx_file(file_bytes)
        image_texts = []
        with zipfile.ZipFile(BytesIO(file_bytes)) as zip_file:
            for file_info in zip_file.infolist():
                if file_info.filename.startswith('word/media/'):
                    image_data = zip_file.read(file_info)
                    try:
                        img_text = describe_image_with_gemini(image_data)
                        image_texts.append(img_text)
                    except Exception as e:
                        pass
        return f"{text_content}\n{' '.join(image_texts)}"
    else:
        raise ValueError("Unsupported file type")

# Set session before each request


@app.before_request
def set_session():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        print("Session ID - ", session['session_id'])

# Route for home page to load index.html


@app.route('/')
def home():
    return render_template("index.html")

# Route for roadmap page


@app.route('/roadmap')
def roadmap():
    return render_template("roadmap.html")

# Route for summary page


@app.route('/summary')
def summary():
    return render_template("summary.html")

# Route for input page


@app.route('/input')
def input():
    return render_template("input.html")


# New route for generating roadmap
@app.route('/get_roadmap', methods=['POST'])
def get_roadmap():
    data = request.form['topic']
    print(data)
    if not data:
        return "Please enter a valid topic", 400

    try:
        full_prompt = ROADMAP_PROMPT.format(topic=data)
        response = model.generate_content(
            contents=full_prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=8192,
                temperature=0.5
            )
        )
        temp = markdown.markdown(response.text)
        print(temp)
        print("HTML file created successfully!")
        return temp if response.candidates else "Failed to generate roadmap"

    except Exception as e:
        return f"Error generating roadmap: {str(e)}", 500


@app.route('/summary_out', methods=['POST'])
def summary_out():
    if request.method == 'POST':
        check_file = 'file' in request.files and request.files.getlist('file')
        check_fname = 'fname' in request.form and request.form['fname']
        if check_file:
            files = request.files.getlist('file')
            combined_text = ""
            for f in files:
                if f and allowed_file(f.filename):
                    # Upload to GCS first
                    filename = secure_filename(f.filename)
                    upload_files(f)
                    session_id = session.get('session_id')
                    file_url = get_user_files(session_id)
                    file_content = read_file_from_gcs(file_url)
                    combined_text += process_file(file_content,
                                                  filename) + "\n"
                else:
                    combined_text += f"Invalid or unsupported file: {f.filename}\n"
            # # Save combined text to a new file with a unique name
            # test_folder = os.path.join('code', 'test')
            # os.makedirs(test_folder, exist_ok=True)
            # unique_filename = f"combined_text_{uuid.uuid4()}.txt"
            # combined_text_path = os.path.join(test_folder, unique_filename)
            # with open(combined_text_path, 'w', encoding='utf-8') as file:
            #     file.write(combined_text)
            # Get evaluation for the combined text
            combined_summary = get_evaluation(combined_text, is_file=True)
            output = f"<h3>Combined File Summary:</h3>{markdown.markdown(combined_summary)}"
            return render_template("summary_out.html", output=output)
        elif check_fname:
            data = request.form['fname']
            text_notes = get_evaluation(data)
            output = f"<h3>Text Notes:</h3><div class='styled-content'>{markdown.markdown(text_notes)}</div>"
            return render_template("summary_out.html", output=output)
        else:
            return render_template("summary_out.html", output="<p>Invalid input received.</p>")


@app.route('/delete-user-files', methods=['GET'])
def accountcleanup():
    print("Function is called.")
    expiration_time = datetime.now(timezone.utc) - timedelta(minutes=2)

    docs = db.collection("user_files").where(
        "uploaded_at", "<", expiration_time).stream()

    deleted_files = []

    for doc in docs:
        data = doc.to_dict()
        session_id = data.get("session_id")
        filename = data.get("filename")

        if session_id and filename:
            file_path = f"sessions/{session_id}/{filename}"
            blob = bucket.blob(file_path)

            try:
                blob.delete()
                db.collection("user_files").document(doc.id).delete()
                print(f"Deleted: {file_path}")
                deleted_files.append(filename)
            except Exception as e:
                print(f"Failed to delete {file_path}: {e}")

    if not deleted_files:
        return "No Files at Firebase\n", 200

    return jsonify({"deleted_files": deleted_files}), 200


@app.route('/evaluate', methods=['GET', 'POST'])
def evaluate():
    try:
        if request.method == 'POST':
            if 'file' in request.files and request.files['file'].filename:
                file = request.files['file']
                if file.filename == '':
                    return "No file selected.", 400

                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    upload_files(file)
                    session_id = session.get('session_id')
                    print(session_id)
                    file_url = get_user_files(session_id)
                    print("URL - ",file_url)
                    file_content = read_file_from_gcs(file_url)
                    file_extension = filename.rsplit('.', 1)[1].lower()

                    if file_extension == 'txt':
                        response, score_response = process_txt_file(
                            file_content.decode('utf-8'))
                    elif file_extension == 'pdf':
                        response, score_response = process_pdf_file(
                            file_content)
                    elif file_extension in {'png', 'jpg', 'jpeg'}:
                        response, score_response = process_img_file(
                            file_content)
                    elif file_extension == 'docx':
                        response, score_response = process_docx_file(
                            file_content)
                    elif file_extension == 'odt':
                        response, score_response = process_odt_file(
                            file_content)
                    else:
                        return "File type not allowed", 400

                    score_list = score_response.text.split(":")
                    if len(score_list) > 1:
                        score = score_list[1].strip()
                        if not score.isdigit():
                            score = "Error: Invalid score format"
                    else:
                        score = "Error: Try again"

                    evaluation_md = response.text
                    evaluation_html = markdown.markdown(evaluation_md)

                    return render_template('evaluate.html', evaluation=evaluation_html, score=score)

            elif 'fname' in request.form:
                text = request.form['fname']
                print(f"Text content: {text[:100]}")
                response, score_response = get_evaluate(text)
                score_list = score_response.text.split(":")
                if len(score_list) > 1:
                    score = score_list[1].strip()
                    if not score.isdigit():
                        score = "Error: Invalid score format"
                else:
                    score = "Error: Try again"

                evaluation_md = response.text
                evaluation_html = markdown.markdown(evaluation_md)

                return render_template('evaluate.html', evaluation=evaluation_html, score=score)
            else:
                return "No input provided.", 400

    except Exception as e:
        return f"An error occurred: {str(e)}", 500

    return render_template("evaluate.html", prompt="Submit a file or text.", score="")


# Run the app in debug mode for development
if __name__ == '__main__':
    app.run(debug=True)

# End of code
