FROM python:3.12.2-slim-bookworm

WORKDIR /app

RUN pip install uvicorn fastapi requests

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
