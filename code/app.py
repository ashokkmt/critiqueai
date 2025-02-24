from flask import Flask, render_template, request, session
import os
import json
from werkzeug.utils import secure_filename
import google.generativeai as genai
import base64
import docx
from odfdo import Document
import markdown
import requests
from google.cloud import storage, vision
from datetime import datetime, timezone
from io import BytesIO
import uuid

with open('code/config.json', 'r') as c:
    params = json.load(c)["params"]

# Configure the Google Generative AI API
genai.configure(api_key=params['gen_api'])
model = genai.GenerativeModel("gemini-2.0-flash")

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24)

# Initialize GCS client
service_account_path = 'code/service-account.json'
storage_client = storage.Client.from_service_account_json(service_account_path)
bucket = storage_client.bucket(params['gcs_bucket_name'])

# Initialize Google Cloud Vision client
if 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
    vision_client = vision.ImageAnnotatorClient()
else:
    vision_client = vision.ImageAnnotatorClient.from_service_account_json(service_account_path)

# Updated prompts for AI evaluation
EVALUATION_PROMPT = "Evaluate the following question and answer pair for accuracy and relevance. Provide a concise summary (max 60-70 words, human -like legal language but simple), justification for your evaluations, and suggest specific improvements. Do not include any introductory text."
SCORE_PROMPT = "Evaluate the following question and answer pair and give it a combined score out of 0 to 10. Just give one word score like 'Score: 7'. (Always give 0 if the answer is absolutely wrong)"

# Updated roadmap prompt to restrict topics to educational subjects
ROADMAP_PROMPT = '''Generate a structured and detailed roadmap for learning {topic}. The roadmap should be divided into logical sections covering in phase-wise manner and also weeks to cover all this in best way:
(Do not add any greetings like okay, sure, here it is. JUST PROVIDE ROADMAP)

Key Concepts – Explain foundational theories, principles, and subtopics in {topic} with at least 25-35 words per subtopic.
Practice Tasks – Provide hands-on exercises, projects, and challenges that reinforce the concepts learned. Each task should include clear instructions and expected outcomes.

(ADD RESOURCES AND BOOK AT THE END)
Best Resources – List the most effective books, courses, websites, and tools to master {topic}. Each resource should be a clickable working link. (ADD SOME DETAIL OF BEST RESOURCES IN 1-2 LINE ONLY)
Books – Include relevant books with their titles and authors for in-depth learning.
The output should be formatted in Markdown for easy readability. (Do not add any markdown word)
Only provide roadmaps for educational topics.'''

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'txt', 'pdf', 'docx', 'odt'}

# Function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Function to evaluate text content
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

def process_txt_file(content):
    return get_evaluate(content)

# Function to process .pdf files
def process_pdf_file(content):
    response = model.generate_content(
        [{'mime_type': 'application/pdf', 'data': content}, EVALUATION_PROMPT], generation_config=genai.GenerationConfig(
            max_output_tokens=200,
            temperature=0.5))
    score = model.generate_content(
        [{'mime_type': 'application/pdf', 'data': content}, SCORE_PROMPT], generation_config=genai.GenerationConfig(
            max_output_tokens=200,
            temperature=0.5))
    return response, score

# Function to process image files (png, jpg, jpeg)
def process_img_file(content):
    image = vision.Image(content=content)
    response = vision_client.text_detection(image=image)
    annotations = response.text_annotations
    if annotations:
        img_text = annotations[0].description
        return get_evaluate(img_text)
    else:
        raise ValueError("No text detected in the image")

# Function to process .docx files
def process_docx_file(content):
    doc = docx.Document(BytesIO(content))
    full_text = [paragraph.text for paragraph in doc.paragraphs]
    docx_text = '\n'.join(full_text)
    return get_evaluate(docx_text)

# Function to process .odt files
def process_odt_file(content):
    odt_file = Document(BytesIO(content))
    text_content = [para.text for para in odt_file.body.get_elements("//text:p")]
    odt_text = '\n'.join(text_content)
    return get_evaluate(odt_text)

# Function to upload file to Google Cloud Storage
def upload_files(file):
    session_id = session.get('session_id')
    unique_filename = f"{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    folder_name = f"sessions/{session_id}/"
    blob = bucket.blob(f"{folder_name}{unique_filename}")
    blob.upload_from_file(file)

    print(session_id)
    print("file uploaded to GCS")

    return f"https://storage.googleapis.com/{bucket.name}/{folder_name}{unique_filename}"

# Function to get file content from Google Cloud Storage
def get_file_content_from_gcs(url):
    response = requests.get(url)
    response.raise_for_status()
    response.encoding = 'utf-8'
    return response.content

# Set session before each request
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

# Route for roadmap page
@app.route('/roadmap')
def roadmap():
    return render_template("roadmap.html")

# Route for summary page
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
            return render_template("summary_out.html", output=f"Your file and text both will get evaluated. Data = {data}")
        elif check_file:
            f = request.files['file']
            return render_template("summary_out.html", output="You will only get summary of file")
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
                    public_url = upload_files(file)
                    file_content = get_file_content_from_gcs(public_url)
                    file_extension = filename.rsplit('.', 1)[1].lower()
                    
                    if file_extension == 'txt':
                        response, score_response = process_txt_file(file_content.decode('utf-8'))
                    elif file_extension == 'pdf':
                        response, score_response = process_pdf_file(base64.standard_b64encode(file_content).decode('utf-8'))
                    elif file_extension in {'png', 'jpg', 'jpeg'}:
                        response, score_response = process_img_file(file_content)
                    elif file_extension == 'docx':
                        response, score_response = process_docx_file(file_content)
                    elif file_extension == 'odt':
                        response, score_response = process_odt_file(file_content)
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
