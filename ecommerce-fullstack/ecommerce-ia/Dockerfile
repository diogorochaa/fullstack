FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock README.md ./
COPY src ./src
COPY data ./data

RUN uv sync --frozen --no-dev

EXPOSE 8100

CMD ["uv", "run", "uvicorn", "ecommerce_ia.main:socket_app", "--host", "0.0.0.0", "--port", "8100"]
