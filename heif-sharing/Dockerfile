FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /app
ADD .python-version /app
ADD pyproject.toml /app
ADD uv.lock /app

RUN uv sync


ADD . /app

WORKDIR /app

EXPOSE 8015
ENV DATA_DIR=/app/data
CMD [ "python", "-m", "uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8015" ]