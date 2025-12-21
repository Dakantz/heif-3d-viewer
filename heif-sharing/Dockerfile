FROM ghcr.io/astral-sh/uv:python3.13-alpine

WORKDIR /app
ADD .python-version /app
ADD pyproject.toml /app
ADD uv.lock /app

RUN uv sync


ADD . /app

WORKDIR /app

EXPOSE 8015
ENV HEIF_BASE_PATH=/data
ENV PATH="/app/.venv/bin:$PATH"
CMD [ "python", "-m", "uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8015" ]