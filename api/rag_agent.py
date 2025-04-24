# project/api/rag_agent.py
import requests
from typing import Optional
import warnings

try:
    from langflow.load import upload_file
except ImportError:
    warnings.warn("Langflow provides a function to help you upload files to the flow. Please install langflow to use it.")
    upload_file = None

# Configurazione per il RAG Agent
BASE_API_URL = "http://10.3.0.11:7860"
FLOW_ID = "77cb1183-6f07-4f1b-b54d-471de3352240"
TWEAKS = {
    "ChatOutput-QytQQ": {},
    "Prompt-StSfY": {},
    "ChatInput-NWIiH": {},
    "OllamaModel-Xdkq0": {},
    "Chroma-SmREr": {},
    "MistalAIEmbeddings-cOsuu": {},
    "File-WtHkE": {},
    "RecursiveCharacterTextSplitter-KVG8k": {},
    "Chroma-p0jvt": {},
    "ParseDataFrame-vHyqw": {},
    "MistalAIEmbeddings-bGl03": {}
}

def run_flow(message: str,
             endpoint: str,
             output_type: str = "chat",
             input_type: str = "chat",
             tweaks: Optional[dict] = None,
             api_key: Optional[str] = None) -> dict:
    """
    Esegue una richiesta all'API del RAG Agent.

    Args:
        message (str): Il messaggio da inviare all'API.
        endpoint (str): L'ID del flusso.
        output_type (str): Il tipo di output.
        input_type (str): Il tipo di input.
        tweaks (dict): Configurazioni aggiuntive per l'API.
        api_key (str): Chiave API per l'autenticazione.

    Returns:
        dict: La risposta JSON dall'API.
    """
    api_url = f"{BASE_API_URL}/api/v1/run/{endpoint}"

    payload = {
        "input_value": message,
        "output_type": output_type,
        "input_type": input_type,
    }
    headers = None
    if tweaks:
        payload["tweaks"] = tweaks
    if api_key:
        headers = {"x-api-key": api_key}
    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()
