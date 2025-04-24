# Chatbot Project

Un'applicazione web per interagire con due agenti: Google Agent (per la suite Google) e RAG Agent (per il retrieval-augmented generation).

## Struttura del progetto

/project
│
├─ /static
│  ├─ /css
│  │  └─ styles.css      # Stili CSS
│  ├─ /js
│  │  └─ scripts.js      # Logica JavaScript
│  └─ continuity.png     # Logo del chatbot
│
├─ /templates
│  └─ index.html         # Struttura HTML
│
├─ /api
│  ├─ google_agent.py    # Logica per il Google Agent
│  └─ rag_agent.py       # Logica per il RAG Agent
│
├─ app.py                # Server FastAPI
└─ README.md             # Documentazione

## Prerequisiti

- Python 3.8+
- FastAPI (`pip install fastapi`)
- Uvicorn (`pip install uvicorn`)
- Requests (`pip install requests`)
- Jinja2 (`pip install jinja2`)

## Installazione

1. Clona il repository:

   git clone <repository-url>
   cd project

Installa le dipendenze:

pip install fastapi uvicorn requests jinja2

Assicurati che il file continuity.png sia nella directory static.

Esecuzione
Avvia il server:

uvicorn app:app --host 0.0.0.0 --port 8000

Apri il browser e vai a:

http://localhost:8000

