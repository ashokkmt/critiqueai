# Use an official Python runtime
FROM python:3.9

# Set the working directory
WORKDIR /app/code

# Copy the requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

# Set environment variables
ENV PORT=8080

# Expose the correct port for Cloud Run
EXPOSE 8080

# Start the Flask app
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
