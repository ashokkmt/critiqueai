from flask import Flask, render_template, request, jsonify, session
import os
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
from datetime import datetime, timezone


cred = credentials.Certificate("code/firebase.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "instant-theater-449913-h4.firebasestorage.app"
})

bucket = storage.bucket()
db = firestore.client()

with open('code/config.json', 'r') as c:
    params = json.load(c)["params"]

# Configure the Google Generative AI API
genai.configure(api_key=params['gen_api'])
model = genai.GenerativeModel("gemini-1.5-flash")
model_pro = genai.GenerativeModel("gemini-1.5-flash")
# model_pro = genai.GenerativeModel("gemini-1.5-pro")  # Output not aligning incorrect when using gemini-1.5-pro

# Initialize Flask app
app = Flask(__name__)
app.secret_key = params['session_key']

# Configure upload folder and file size limits
# Path to save uploaded files
app.config['UPLOAD_FOLDER'] = params['upload_folder']
app.config['MAX_CONTENT_LENGTH'] = 8 * 1024 * 1024  # Max file size: 8 MB

# Prompts for AI evaluation
prompt = "Evaluate the following question and answer pair for accuracy and relevance, provide a concise summary (max 60-70 words, human-like legal language but simple), give proper justification for your evaluations, and suggest specific improvements."

prompt2 = "Evaluate the following question and answer pair and give it a combined score out of 0 to 10. Just give one word score like 'Score : 7'. (Always give 0 if answer is absolutely wrong) "

ROADMAP_PROMPT = '''Provide a step-by-step learning roadmap for {topic}. Include key concepts, practice tasks, and real-world applications. 
Also, list the best resources (books, websites, courses, and tools) at the end. explain each sub point in atleast 80-100 words , dont forget to add working links without description and try to check that links may not be broken  '''

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'txt', 'pdf', 'docx', 'odt'}

# function to check allowed file extensions


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to process .txt files


def get_evaluate(text):
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
            f = request.files['file']

            session_id = session.get('session_id')
            unique_filename = f"{uuid.uuid4()}.{f.filename.split('.')[-1]}"
            blob = bucket.blob(f"sessions/{session_id}/{unique_filename}")
            blob.upload_from_file(f)
            blob.make_public()

            print(session_id)
            print(unique_filename)
            print(blob.public_url)
            print(datetime.now(timezone.utc))
            print("file uploaded now updating db")
            
            db.collection("user_files").document(unique_filename).set({
                "session_id": session_id,
                "filename": unique_filename,
                "url": blob.public_url,
                "uploaded_at": datetime.now(timezone.utc)
            })

            res = jsonify({"message": "File uploaded", "url": blob.public_url})
            print(res)

            return render_template("summary_out.html", output=f"You will only get summary of file.\n{res}")

        elif check_fname:
            data = request.form['fname']
            print(data)
            return render_template("summary_out.html", output=data)

        else:
            return render_template("summary_out.html", output="Invalid input received.")


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
        return response.text if response.candidates else "Failed to generate roadmap"

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
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file_ext = os.path.splitext(filename)[1].lower()
                f.save(file_path)

                try:
                    # Process the uploaded file based on its extension
                    if file_ext == ".txt":
                        response, score = process_txt_file(file_path)
                    elif file_ext == ".pdf":
                        response, score = process_pdf_file(file_path)
                    elif file_ext in [".png", ".jpg", ".jpeg"]:
                        response, score = process_img_file(file_path)
                    elif file_ext == ".docx":
                        response, score = process_docx_file(file_path)
                    elif file_ext == ".odt":
                        response, score = process_odt_file(file_path)

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
    app.run(debug=True)
