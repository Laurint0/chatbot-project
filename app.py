# project/app.py
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from api.google_agent import run_flow as run_google_flow
from api.rag_agent import run_flow as run_rag_flow, FLOW_ID as RAG_FLOW_ID, TWEAKS as RAG_TWEAKS
from api.google_agent import FLOW_ID as GOOGLE_FLOW_ID, TWEAKS as GOOGLE_TWEAKS

app = FastAPI()

# Monta la directory statica per servire CSS, JS e immagini
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configura il templating con Jinja2
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def get_chat(request: Request):
    """
    Serve la pagina principale del chatbot.

    Args:
        request (Request): La richiesta HTTP.

    Returns:
        TemplateResponse: Il template HTML renderizzato.
    """
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/chat/google")
async def chat_google(message: str):
    """
    Gestisce i messaggi inviati al Google Agent.

    Args:
        message (str): Il messaggio dell'utente.

    Returns:
        dict: La risposta del Google Agent.
    """
    response = run_google_flow(message, endpoint=GOOGLE_FLOW_ID, tweaks=GOOGLE_TWEAKS)
    bot_message = response.get("outputs", [{}])[0].get("outputs", [{}])[0].get("results", {}).get("message", {}).get("text", "Errore nella risposta")
    return {"message": bot_message}

@app.get("/chat/rag")
async def chat_rag(message: str):
    """
    Gestisce i messaggi inviati al RAG Agent.

    Args:
        message (str): Il messaggio dell'utente.

    Returns:
        dict: La risposta del RAG Agent.
    """
    response = run_rag_flow(message, endpoint=RAG_FLOW_ID, tweaks=RAG_TWEAKS)
    bot_message = response.get("outputs", [{}])[0].get("outputs", [{}])[0].get("results", {}).get("message", {}).get("text", "Errore nella risposta")
    return {"message": bot_message}
