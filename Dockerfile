# 1️⃣ Use an official Python runtime as a base image
FROM python:3.12-slim

# 2️⃣ Set the working directory in the container
WORKDIR /app

# 3️⃣ Install system dependencies (like poppler-utils)
RUN apt-get update && apt-get install -y poppler-utils

# 4️⃣ Copy the requirements file into the container
COPY requirements.txt .

# 5️⃣ Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 6️⃣ Copy the rest of the application code into the container
COPY . .

# 7️⃣ Set environment variable for Cloud Run
ENV PORT=8080

# 8️⃣ Expose the default Cloud Run port
EXPOSE 8080

# 9️⃣ Start the app using Gunicorn (production ready)
CMD ["gunicorn", "-w", "5", "--timeout", "120", "-b", "0.0.0.0:8080", "app:app"]
