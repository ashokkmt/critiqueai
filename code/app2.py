from flask import Flask, render_template, request
import google.generativeai as genai

app = Flask(__name__)

# Configure API Key
genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-pro")

ROADMAP_PROMPT = '''Provide a step-by-step learning roadmap for {topic}. Include key concepts, practice tasks, and real-world applications. 
Also, list the best resources (books, websites, courses, and tools) at the end. explain each sub point in atleast 80-100 words , dont forget to add working links without description and try to check that links may not be broken  '''

@app.route('/get_roadmap', methods=['POST'])
def get_roadmap():
    topic = request.form.get('topic', '').strip()
    if not topic:
        return "Please enter a valid topic", 400
    
    try:
        full_prompt = ROADMAP_PROMPT.format(topic=topic)
        response = model.generate_content(
            contents=full_prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=1000,
                temperature=0.3
            )
        )
        return response.text if response.candidates else "Failed to generate roadmap"
    
    except Exception as e:
        return f"Error generating roadmap: {str(e)}", 500

@app.route("/")
def home():
    return render_template("roadmap.html")

if __name__ == "__main__":
    app.run(debug=True)