from google import genai
from google.genai.types import (
    GenerateContentConfig,
    GoogleSearch,
    HarmBlockThreshold,
    HarmCategory,
    Part,
    SafetySetting,
    GenerationConfig,
)


safety_settings = [
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    ),
    SafetySetting(
        category=HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold=HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    ),
]

content_config = GenerateContentConfig(
    temperature=1,
    max_output_tokens=8192,
    safety_settings=safety_settings,
)


PROJECT_ID = "instant-theater-449913-h4"
LOCATION = "us-central1"
# PROJECT_NUMBER: 952301619936
client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
# client = genai.Client(http_options=HttpOptions(api_version="v1"))

# MODEL = "gemini-2.0-flash"
MODEL = "gemini-1.5-pro"
# MODEL = "gemini-1.5-flash"

# if client._api_client.project:
#     print(
#         f"Using Vertex AI with project: {client._api_client.project} in location: {client._api_client.location}"
#     )


prompt = "Evaluate the following question and answer pair for accuracy and relevance, provide a concise summary (max 60-70 words, human-like legal language but simple), give proper justification for your evaluations, and suggest specific improvements.(Do not markdown syntax)"

prompt2 = "Evaluate the following question and answer pair and give it a combined score out of 0 to 10. Just give one word score like 'Score : 7'. (Always give 0 if answer is absolutely wrong) "

url = "gs://instant-theater-449913-h4.firebasestorage.app/sessions/057942bc-21f4-4d17-a4c4-cc2461672993/332667be-df1f-4c04-a721-484a19f82114.txt"
text_file = Part.from_uri(file_uri=url, mime_type="text/plain")

response = client.models.generate_content(
    model=MODEL,
    contents=[
        text_file,
        prompt,
    ],
    config=content_config
)

score = client.models.generate_content(
    model=MODEL,
    contents=[
        text_file,
        prompt2,
    ],
    config=content_config
)

print(response.text)
print(score.text)
