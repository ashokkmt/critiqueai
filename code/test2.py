import google.generativeai as genai
from google.cloud import vision
import PyPDF2
import docx
import io
import concurrent.futures
import firebase_admin
from firebase_admin import credentials, firestore, storage


cred = credentials.Certificate("code/firebase.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "instant-theater-449913-h4.firebasestorage.app"
})

bucket = storage.bucket()
db = firestore.client()

# Configure APIs
genai.configure(api_key="YOUR_GEMINI_API_KEY")
vision_client = vision.ImageAnnotatorClient()

FIRESTORE_COLLECTION = "user_files"  # Firestore collection where file URLs are stored

def get_user_files(session_id):
    """Fetches gs:// URLs for a user from Firestore."""
    docs = db.collection("user_files").where("session_id", "==", session_id).stream()
    # docs = firestore_client.collection(FIRESTORE_COLLECTION).where("session_id", "==", session_id).stream()
    file_urls = []
    for doc in docs:
        file_url = doc.to_dict()["url"]
        print(file_url)
        file_urls.append(file_url)

    # print(file_urls)
    return file_urls

def read_file_from_gcs(gs_url):
    """Reads a file as bytes directly from Firebase Storage."""
    file_path = '/'.join(gs_url.split('/')[3:])
    print(file_path)
    blob = bucket.blob(file_path)
    return blob.download_as_bytes(), blob.name

def extract_text_from_pdf(pdf_bytes):
    """Extracts text from a PDF using PyPDF2."""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    extracted_text = []

    for page in pdf_reader.pages:
        text = page.extract_text()
        extracted_text.append(text if text else "[Image/Chart detected]")

    return "\n".join(extracted_text)

def extract_images_from_pdf(pdf_bytes):
    """Extracts images from a PDF."""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    images = []

    for page in pdf_reader.pages:
        for img in page.images:
            images.append(img.data)  # Extract image bytes

    return images

def process_img_file(content, file_name):
    """Extracts text from images or describes diagrams using Gemini Vision."""
    image = vision.Image(content=content)
    response = vision_client.text_detection(image=image)
    annotations = response.text_annotations

    if annotations:
        return f"Extracted Text from {file_name}:\n{annotations[0].description}"
    else:
        model = genai.GenerativeModel("gemini-pro-vision")
        response = model.generate_content([
            "Describe the content of this image, including any charts, diagrams, or meaningful patterns.",
            {"mime_type": "image/jpeg", "data": content}
        ])
        return f"Image Description of {file_name}:\n{response.text}"

def process_file(gs_url):
    """Processes a file based on its type (Text, PDF, DOCX, Image)."""
    file_bytes, file_name = read_file_from_gcs(gs_url)
    file_ext = file_name.split(".")[-1].lower()

    if file_ext in ["txt", "csv", "json"]:  # Plain text files
        return file_bytes.decode("utf-8")

    elif file_ext == "pdf":  # PDF files (Text + Images)
        text_content = extract_text_from_pdf(file_bytes)
        images = extract_images_from_pdf(file_bytes)
        image_descriptions = "\n".join([process_img_file(img, file_name) for img in images]) if images else ""
        return f"Extracted Text:\n{text_content}\n\nImage Descriptions:\n{image_descriptions}"

    elif file_ext == "docx":  # Word documents
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs])

    elif file_ext in ["png", "jpg", "jpeg"]:  # Image files (OCR + Gemini Vision)
        return process_img_file(file_bytes, file_name)

    else:
        return f"[Unsupported file type: {file_name}]"

def generate_content_for_user(user_id):
    """Processes all user files and generates a compiled response using Gemini AI."""
    file_urls = get_user_files(user_id)
    
    # for url in file_urls:
    #     read_file_from_gcs(url)
    print("\n")
    # Process files in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        file_contents = list(executor.map(process_file, file_urls))

    # # Combine extracted content
    combined_text = "\n\n".join(file_contents)
    
    with open("output.txt", "w") as file:
        file.write(combined_text)

    # # Send all extracted content to Gemini AI
    # model = genai.GenerativeModel("gemini-pro")
    # response = model.generate_content(combined_text)

    # return response.text

# Example Usage
user_id = "3e175de9-5e4a-4f8e-8308-a15b97555f80"
final_output = generate_content_for_user(user_id)
# print(final_output)
