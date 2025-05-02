---

# Chatbot Project

Un'applicazione web per interagire con due agenti:

* **Google Agent**: per interfacciarsi con i servizi della suite Google.
* **RAG Agent**: per il retrieval-augmented generation.

---

## 📁 Struttura del Progetto

```
/project
│
├── /static
│   ├── /css
│   │   └── styles.css          # Stili CSS
│   ├── /js
│   │   └── scripts.js          # Logica JavaScript
│   └── continuity.png          # Logo del chatbot
│
├── /templates
│   └── index.html              # Template HTML
│
├── /api
│   ├── google_agent.py         # Logica per il Google Agent
│   └── rag_agent.py            # Logica per il RAG Agent
│
├── app.py                      # Server FastAPI
└── README.md                   # Documentazione
```

---

## ✅ Prerequisiti

* Python **3.8+**
* FastAPI
* Uvicorn
* Requests
* Jinja2

Installa i pacchetti richiesti con:

```bash
pip install fastapi uvicorn requests jinja2
```

---

## 🔧 Installazione

1. Clona il repository:

```bash
git clone <url-del-repo>
cd project
```

2. Verifica che il file `continuity.png` sia presente nella cartella `static`.

---

## 🚀 Esecuzione

Avvia il server con il comando:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Poi apri il browser e visita:

```
http://localhost:8000
```

---

## 📌 Note

* Assicurati di avere le API key o configurazioni necessarie se gli agenti richiedono accesso a servizi esterni (es. Google API).
* Puoi modificare lo stile e la logica frontend nei file `styles.css` e `scripts.js`.

---
