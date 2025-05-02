
# Chatbot Project

Un'applicazione web che consente di interagire con due agenti AI:

* **Google Agent**: interfaccia con i servizi della suite Google.
* **RAG Agent**: implementa un sistema di Retrieval-Augmented Generation.([lucamainieri.it][1], [GitHub][2])

Entrambi gli agenti sono stati progettati utilizzando **Langflow**, una piattaforma low-code che permette di creare agenti AI attraverso un'interfaccia visiva drag-and-drop .([lucamainieri.it][1])

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

## 🤖 Agenti AI con Langflow

I due agenti, **Google Agent** e **RAG Agent**, sono stati sviluppati utilizzando **Langflow**, una piattaforma open-source che consente di costruire agenti AI attraverso un'interfaccia visiva drag-and-drop .([lucamainieri.it][1])

### Google Agent

Questo agente è progettato per interagire con i servizi della suite Google, come Google Calendar, Gmail e Google Drive. Utilizza componenti di Langflow per gestire l'autenticazione e le API di Google, permettendo operazioni come la lettura di email, la gestione degli eventi del calendario e l'accesso ai file su Drive.

### RAG Agent

Il RAG (Retrieval-Augmented Generation) Agent combina un modello di linguaggio con un sistema di recupero di informazioni. Utilizza Langflow per orchestrare il flusso tra il recupero di documenti pertinenti e la generazione di risposte coerenti e contestuali, migliorando la qualità delle risposte fornite dall'agente.

Per ulteriori informazioni su Langflow e su come costruire agenti AI, visita la [documentazione ufficiale di Langflow](https://docs.langflow.org/).


[1]: https://www.lucamainieri.it/langflow-il-futuro-nei-framework-visivi-per-ai-e-multi-agent/?utm_source=chatgpt.com "Langflow, il framework per realizzare Agenti AI e Multi-Agent AI in ..."
[2]: https://github.com/langflow-ai/langflow?utm_source=chatgpt.com "Langflow is a powerful tool for building and deploying AI ... - GitHub"
