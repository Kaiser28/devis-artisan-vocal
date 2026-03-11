# Architecture LangChain - Agence Chatbot Artisan
# Dockerfile multi-stage pour optimiser taille image

# =========================================
# Stage 1 : Builder - Installation dépendances
# =========================================
FROM python:3.11-slim as builder

WORKDIR /app

# Installer dépendances système pour compilation
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements
COPY requirements.txt .

# Installer dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# =========================================
# Stage 2 : Runtime - Image finale légère
# =========================================
FROM python:3.11-slim

WORKDIR /app

# Créer utilisateur non-root pour sécurité
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Copier dépendances depuis builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copier code application
COPY --chown=appuser:appuser . .

# Créer dossiers nécessaires
RUN mkdir -p output/devis config logs && \
    chown -R appuser:appuser output config logs

# Passer en utilisateur non-root
USER appuser

# Variables d'environnement par défaut
ENV PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    LOG_LEVEL=INFO \
    PORT=8000

# Exposer port API
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Commande de démarrage
CMD ["uvicorn", "api.webhook:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
