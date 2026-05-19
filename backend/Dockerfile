# Use official Python lightweight image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies for psycopg2 (PostgreSQL)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
# Note: We expect to run from the root, so we copy the backend folder
COPY . /app/backend

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose the port Cloud Run expects
EXPOSE 8080

# Command to run the application
# We use module path properly
CMD ["python3", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
