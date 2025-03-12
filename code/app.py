from flask import Flask, render_template, request, session
import os
import json
import docx
from odfdo import Document
import markdown
import requests
from werkzeug.utils import secure_filename
import google.generativeai as genai
from google.cloud import storage, vision, documentai_v1 as documentai
from PIL import Image
from io import BytesIO
import zipfile
import uuid
from google.oauth2 import service_account  # Added import
import tempfile  # Added import
from dotenv import load_dotenv  # Added import

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

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24)

# Initialize GCS client
service_account_path = 'code/service-account.json'
credentials = service_account.Credentials.from_service_account_file(service_account_path)  # Load credentials once

# Initialize all Google Cloud clients with the same credentials
storage_client = storage.Client(credentials=credentials)
bucket = storage_client.bucket(os.getenv('GCS_BUCKET_NAME'))
vision_client = vision.ImageAnnotatorClient(credentials=credentials)
docai_client = documentai.DocumentProcessorServiceClient(credentials=credentials)

# Document AI processor configuration
processor_name = docai_client.processor_path(
    os.getenv('DOCAI_PROJECT_ID'),
    os.getenv('DOCAI_LOCATION'),
    os.getenv('DOCAI_PROCESSOR_ID')
)

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

# Helper function to extract text from images
def extract_text_from_image(content):
    image = vision.Image(content=content)
    response = vision_client.text_detection(image=image)
    annotations = response.text_annotations
    if annotations:
        return annotations[0].description
    else:
        raise ValueError("No text detected in the image")

# Modified image processing function
def process_img_file(content):
    try:
        img_text = extract_text_from_image(content)
        return get_evaluate(img_text)
    except Exception as e:
        return f"Image Error: {str(e)}"

# Helper function to extract text from PDF files
def extract_text_from_pdf(content):
    request = {
        "name": processor_name,
        "raw_document": {
            "content": content,
            "mime_type": "application/pdf",
        }
    }
    result = docai_client.process_document(request)
    return result.document.text

# Function to process .pdf files
def process_pdf_file(content):
    try:
        extracted_text = extract_text_from_pdf(content)
        return get_evaluate(extracted_text)
    except Exception as e:
        return f"PDF Error: {str(e)}"

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
                        img_text = extract_text_from_image(image_data)
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
                    public_url = upload_files(f)
                    file_content = get_file_content_from_gcs(public_url)
                    combined_text += process_file(file_content, filename) + "\n"
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

def process_file(content, filename):
    if filename.endswith('.txt'):
        return content.decode('utf-8')
    elif filename.endswith('.pdf'):
        return extract_text_from_pdf(content)
    elif filename.endswith('.png') or filename.endswith('.jpg') or filename.endswith('.jpeg'):
        return extract_text_from_image(content)
    elif filename.endswith('.odt'):
        odt_file = Document(content)
        text_content = [para.text for para in odt_file.body.get_elements("//text:p")]
        return '\n'.join(text_content)
    elif filename.endswith('.docx'):
        text_content = read_docx_file(content)
        image_texts = []
        with zipfile.ZipFile(BytesIO(content)) as zip_file:
            for file_info in zip_file.infolist():
                if file_info.filename.startswith('word/media/'):
                    image_data = zip_file.read(file_info)
                    try:
                        img_text = extract_text_from_image(image_data)
                        image_texts.append(img_text)
                    except Exception as e:
                        pass
        return f"{text_content}\n{' '.join(image_texts)}"
    else:
        raise ValueError("Unsupported file type")
    


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
                        response, score_response = process_pdf_file(file_content)
                    elif file_extension in {'png', 'jpg', 'jpeg'}:
                        response, score_response = process_img_file(file_content)
                    elif file_extension == 'docx':
                        response, score_response = process_docx_file(file_content)
                    elif file_extension == 'odt':
                        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                            temp_file.write(file_content)
                            temp_file_path = temp_file.name
                        response, score_response = process_odt_file(temp_file_path)
                        os.remove(temp_file_path)
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