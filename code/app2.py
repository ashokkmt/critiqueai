from flask import Flask, render_template, request
import google.generativeai as genai
import json
import markdown

with open('code/config.json', 'r') as c:
    params = json.load(c)["params"]

app = Flask(__name__)

# Configure API Key
genai.configure(api_key=params['gen_api'])
model = genai.GenerativeModel("gemini-2.0-flash")

ROADMAP_PROMPT = '''Generate a structured and detailed roadmap for learning {topic}. The roadmap should be divided into logical sections covering in phase-wise manner and also weeks to cover all this in best way:
(Do not add any greetings like okay, sure, here it is. JUST PROVIDE ROADMAP)

Key Concepts – Explain foundational theories, principles, and subtopics in {topic} with at least 25-35 words per subtopic.
Practice Tasks – Provide hands-on exercises, projects, and challenges that reinforce the concepts learned. Each task should include clear instructions and expected outcomes.

(ADD RESOURCES AND BOOK AT THE END)
Best Resources – List the most effective books, courses, websites, and tools to master {topic}. Each resource should be a clickable working link. (ADD SOME DETAIL OF BEST RESOURCES IN 1-2 LINE ONLY)
Books – Include relevant books with their titles and authors for in-depth learning.
The output should be formatted in Markdown for easy readability.(Dont add any markdown word)'''

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
        # print(response.text)
        temp = markdown.markdown(response.text)
        print(temp)
        # path = fr"C:\Users\pprer\OneDrive\Desktop\git\critiqueai\test\{data}.html"
        # with open(path, "w", encoding="utf-8") as file:
        #     file.write(temp)
        print("HTML file created successfully!")
        return temp if response.candidates else "Failed to generate roadmap"
    
    except Exception as e:
        return f"Error generating roadmap: {str(e)}", 500

@app.route("/")
def home():
    return render_template("roadmap.html")

if __name__ == "__main__":
    app.run(debug=True)