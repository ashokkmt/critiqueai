# 1️⃣ Use an official Python runtime as a base image
<<<<<<< HEAD
FROM python:3.9

# Set the working directory
WORKDIR /app/code
=======
FROM python:3.12

# Set the working directory
WORKDIR /app

>>>>>>> 3044c46a7f485dca27def97e2673f28b3bc69065

# 3️⃣ Copy the requirements file into the container
COPY requirements.txt .

# 4️⃣ Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5️⃣ Copy the rest of your application code
COPY . .

# 6️⃣ Set the environment variable for Cloud Run
ENV PORT=8080

# 7️⃣ Expose port 8080 (Cloud Run default)
EXPOSE 8080

# 8️⃣ Start the Flask app using Gunicorn (for production)
<<<<<<< HEAD
=======

>>>>>>> 3044c46a7f485dca27def97e2673f28b3bc69065
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
