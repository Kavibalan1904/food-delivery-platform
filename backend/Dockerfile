# 1. Base Image: Lightweight Python 3.11
FROM python:3.11-slim

# 2. Set working directory inside container
WORKDIR /app

# 3. Environment settings: disable python byte-code & enable instant stdout/stderr flushing
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 4. Layer Caching: Install dependencies first before copying code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy backend application source code
COPY . .

# 6. Expose the FastAPI port
EXPOSE 8000

# 7. Start the FastAPI server using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
