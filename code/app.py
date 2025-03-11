from flask import Flask, render_template, request, jsonify, session
import os
import io
import json
from werkzeug.utils import secure_filename
import google.generativeai as genai
import base64
import PIL.Image
import docx
from odfdo import Document
import firebase_admin
from firebase_admin import credentials, storage, firestore
import uuid
from datetime import datetime, timezone, timedelta
import markdown
from pdf2image import convert_from_bytes
import concurrent.futures
from dotenv import load_dotenv


load_dotenv()

cred = credentials.Certificate("code/firebase.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "instant-theater-449913-h4.firebasestorage.app"
})

bucket = storage.bucket()
db = firestore.client()

# Configure the Google Generative AI API
genai.configure(api_key=os.getenv("GEN_API"))
model = genai.GenerativeModel("gemini-2.0-flash")
model_pro = genai.GenerativeModel("gemini-2.0-flash")

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("SESSION_KEY")

# Configure upload folder and file size limits
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max file size: 8 MB

# Prompts for AI evaluation
prompt = "Evaluate the following question and answer pair for accuracy and relevance, provide a concise summary (max 60-70 words, human-like legal language but simple), give proper justification for your evaluations, and suggest specific improvements."

prompt2 = "Evaluate the following question and answer pair and give it a combined score out of 0 to 10. Just give one word score like 'Score : 7'. (Always give 0 if answer is absolutely wrong) "

ROADMAP_PROMPT = '''Provide a step-by-step learning roadmap for {topic}. Include key concepts, practice tasks, and real-world applications. 
Also, list the best resources (books, websites, courses, and tools) at the end. explain each sub point in atleast 80-100 words , dont forget to add working links without description and try to check that links may not be broken  '''

pdf_extract_prompt = """Extract all possible information from the given image while maintaining its original structure and meaning. Ensure that:
- **For Text:** Extract all visible text exactly as it appears, preserving formatting, font styles (bold, italic, underline), and special symbols.
- **For Tables:** Identify and extract all tabular data while preserving row and column structure.
- **For Charts & Graphs:** Describe the type of chart, key trends, axes labels, legends, and any numerical values present.
- **For Diagrams & Figures:** Identify objects, flowcharts, and connections, and describe their meaning.
- **For Mathematical Equations:** Extract equations exactly as shown, maintaining proper mathematical notation.
- **For Images with Embedded References:** Identify references, labels, and any related annotations.

If any one of the field is not present then simply write NONE there.
"""

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'txt', 'pdf', 'docx', 'odt'}

# function to check allowed file extensions


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to process .txt files


def get_evaluate(text):
    print("in evaluation function")
    print(text)
    response = model.generate_content(
        [text, prompt], generation_config=genai.GenerationConfig(
            max_output_tokens=1000,
            temperature=0.5,))
    score = model.generate_content(
        [text, prompt2], generation_config=genai.GenerationConfig(
            max_output_tokens=1000,
            temperature=0.5,))

    return response, score


def process_txt_file(path):
    with open(path, "r") as text_file:
        doc_text = text_file.read()

    return get_evaluate(doc_text)

# Function to process .pdf files


def process_pdf_file(path):
    with open(path, "rb") as doc_file:
        doc_data = base64.standard_b64encode(doc_file.read()).decode("utf-8")

    response = model.generate_content(
        [{'mime_type': 'application/pdf', 'data': doc_data}, prompt], generation_config=genai.GenerationConfig(
            max_output_tokens=200,
            temperature=0.5,))
    score = model.generate_content(
        [{'mime_type': 'application/pdf', 'data': doc_data}, prompt2], generation_config=genai.GenerationConfig(
            max_output_tokens=200,
            temperature=0.5,))

    return response, score

# Function to process image files (png, jpg, jpeg)


def process_img_file(path):
    img_file = PIL.Image.open(path)
    return get_evaluate(img_file)

# Function to process .docx files


def process_docx_file(path):
    doc = docx.Document(path)
    full_text = [paragraph.text for paragraph in doc.paragraphs]
    docx_text = '\n'.join(full_text)

    return get_evaluate(docx_text)

# Function to process .odt files


def process_odt_file(path):
    odt_file = Document(path)
    text_content = [
        para.text for para in odt_file.body.get_elements("//text:p")]
    odt_text = '\n'.join(text_content)

    return get_evaluate(odt_text)


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
    
def get_user_files(session_id):
    """Fetches gs:// URLs for a user from Firestore."""
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


def extract_images_from_pdf(pdf_bytes):
    """Extracts images from a PDF using pdf2image."""
    images = convert_from_bytes(pdf_bytes)  # Converts each page into an image
    return images  # Returns list of PIL images


def encode_image(image):
    """Convert PIL Image to Base64 format for Gemini."""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


def describe_image_with_gemini(image, flag=False):
    """Sends an image to Gemini for description."""
    model = genai.GenerativeModel("gemini-2.0-flash-lite")
    if not flag:
        img_base64 = encode_image(image)
    else:
        img_base64 = image

    contents = [
        {
            "parts": [
                {"text": pdf_extract_prompt},
                {"inline_data": {"mime_type": "image/png", "data": img_base64}}
            ]
        }
    ]

    response = model.generate_content(contents)
    return response.text  # Return AI-generated description


def process_pdf(pdf_bytes):
    """Extracts text and images, processes them, and prepares final content for Gemini."""
    # extracted_text = extract_text_from_pdf(pdf_bytes)
    images = extract_images_from_pdf(pdf_bytes)

    # Process images and get descriptions only if images are found
    image_descriptions = []
    if images:
        image_descriptions = [
            describe_image_with_gemini(img) for img in images]

    # Append image descriptions to extracted text
    final_text = ""
    if image_descriptions:
        final_text += "\n\nImage Descriptions:\n" + \
            "\n".join(image_descriptions)

    return final_text


def process_file(gs_url):
    """Processes a file based on its type (Text, PDF, DOCX, Image)."""
    file_bytes, file_name = read_file_from_gcs(gs_url)
    file_ext = file_name.split(".")[-1].lower()

    if file_ext in ["txt", "csv", "json"]:  # Plain text files
        return file_bytes.decode("utf-8")

    elif file_ext == "pdf":  # PDF files (Text + Images)
        final_extracted_content = process_pdf(file_bytes)
        return final_extracted_content

    elif file_ext == "docx":  # Word documents
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs])

    # Image files (OCR + Gemini Vision)
    elif file_ext in ["png", "jpg", "jpeg"]:
        return describe_image_with_gemini(file_bytes, True)

    else:
        return f"[Unsupported file type: {file_name}]"


def generate_content_for_user(user_id):
    """Processes all user files and generates a compiled response using Gemini AI."""
    file_urls = get_user_files(user_id)

    print("\n")
    # Process files in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        file_contents = list(executor.map(process_file, file_urls))

    print("\n")
    # # Combine extracted content
    combined_text = "\n\n".join(file_contents)

    with open("output.txt", "w") as file:
        file.write(combined_text)

    return combined_text


@app.before_request
def set_session():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        print("Session ID - ", session['session_id'])

# Route for home page


@app.route('/')
def home():
    return render_template("index.html")

# Route for input page


@app.route('/input')
def input():
    return render_template("input.html")

# Route for evaluation logic


@app.route('/roadmap')
def roadmap():
    return render_template("roadmap.html")


@app.route('/summary')
def summary():
    return render_template("summary.html")


@app.route('/summary_out', methods=['POST'])
def summary_out():
    if request.method == 'POST':
        check_file = 'file' in request.files and request.files['file'].filename
        check_fname = 'fname' in request.form and request.form['fname']
        if check_file and check_fname:
            data = request.form['fname']
            return render_template("summary_out.html", output=f"Your file and text both will get evaluted. Data = {data}")

        elif check_file:
            files = request.files.getlist('file')

            for f in files:
                upload_files(f)

            session_id = session.get('session_id')
            print(session_id)
            response = generate_content_for_user(session_id)
            return render_template("summary_out.html", output=f"File is generated\n\n{response}")

        elif check_fname:
            data = request.form['fname']
            print(data)
            return render_template("summary_out.html", output=data)

        else:
            return render_template("summary_out.html", output="Invalid input received.")


@app.route('/delete-user-files', methods=['GET'])
def accountcleanup():
    print("Function is called.")
    expiration_time = datetime.now(timezone.utc) - timedelta(minutes=5)

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


@app.route('/get_roadmap', methods=['POST'])
def get_roadmap():
    topic = request.form['topic']
    if not topic:
        return "Please enter a valid topic", 400

    try:
        full_prompt = ROADMAP_PROMPT.format(topic=topic)
        response = model_pro.generate_content(
            contents=full_prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=1000,
                temperature=0.3
            )
        )
        temp = markdown.markdown(response.text)
        return temp

    except Exception as e:
        return f"Error generating roadmap: {str(e)}", 500


@app.route('/evaluate', methods=['GET', 'POST'])
def evaluate():
    if request.method == 'POST':
        if 'file' in request.files and request.files['file'].filename:
            # Handle file upload
            f = request.files['file']
            if f and allowed_file(f.filename):
                filename = secure_filename(f.filename)
                # file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file_ext = os.path.splitext(filename)[1].lower()
                # f.save(file_path)
                blob = bucket.blob(
                    f"sessions/895c9db0-ea77-4c65-9203-141b1122ec24/2a249d38-5991-4bab-9962-4e8ac499b740.docx")
                file_data = blob.download_as_bytes()
                file_uri = "gs://instant-theater-449913-h4.firebasestorage.app/sessions/895c9db0-ea77-4c65-9203-141b1122ec24/146abc1f-2f9c-45e6-9bf1-74264471cb0a.txt"
                file_uri2 = "https://storage.googleapis.com/instant-theater-449913-h4.firebasestorage.app/sessions/895c9db0-ea77-4c65-9203-141b1122ec24/146abc1f-2f9c-45e6-9bf1-74264471cb0a.txt"

                try:
                    gemini_file = {
                        "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # Change according to file type
                        "data": file_data
                    }
                    response, score = get_evaluate(gemini_file)
                    # Process the uploaded file based on its extension
                    # if file_ext == ".txt":
                    #     response, score = process_txt_file(file_path)
                    # elif file_ext == ".pdf":
                    #     response, score = process_pdf_file(file_path)
                    # elif file_ext in [".png", ".jpg", ".jpeg"]:
                    #     response, score = process_img_file(file_path)
                    # elif file_ext == ".docx":
                    #     response, score = process_docx_file(file_path)
                    # elif file_ext == ".odt":
                    #     response, score = process_odt_file(file_path)

                    # Extract text and score for rendering
                    response_text = response.text if response and response.candidates else "No response from the AI."
                    score_text = score.text if score and score.candidates else "No score available."

                    # Render evaluate.html with results
                    return render_template("evaluate.html", prompt=response_text, score=score_text)

                except Exception as e:
                    return render_template("evaluate.html", prompt=f"Error: {str(e)}", score="No score generated.")

            return render_template("evaluate.html", prompt="Invalid file type or no file uploaded.", score="")

        elif 'fname' in request.form and request.form['fname']:
            # Handle text input for question and answer evaluation
            data = request.form['fname']
            try:
                # Generate AI response

                response, score = get_evaluate(data)

                response_text = response.text if response and response.candidates else "No response from the AI."
                score_text = score.text if score and score.candidates else "No score available."

                return render_template("evaluate.html", prompt=response_text, score=score_text)

            except Exception as e:
                return render_template("evaluate.html", prompt=f"Error: {str(e)}", score="")

        else:
            return render_template("evaluate.html", prompt="No valid input received.", score="")

    return render_template("evaluate.html", prompt="Submit a file or text.", score="")


# Run the app in debug mode for development
if __name__ == '__main__':
    app.run(port=int(os.environ.get("PORT", 8080)),host='0.0.0.0',debug=True)
