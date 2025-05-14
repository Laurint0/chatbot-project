# project/api/google_agent.py
import requests

# Configurazione per il Google Agent, queste informazioni le trovi su langflow (API). In futuro caricherò i flussi
BASE_API_URL = "$indirizzo:7860"
FLOW_ID = "$KEY"
TWEAKS = {
    "ComposioAPI-UzJNG": {},
    "Agent-iMCao": {},
    "OllamaModel-0Clrm": {},
    "ChatInput-s5aAE": {},
    "ChatOutput-NsjFO": {},
    "Prompt-OCtfo": {},
    "ComposioAPI-gKHRu": {},
    "MistralModel-BUgqF": {}
}

def run_flow(message: str, endpoint: str = FLOW_ID, output_type: str = "chat", input_type: str = "chat", tweaks: dict = TWEAKS):
    """
    Esegue una richiesta all'API del Google Agent.

    Args:
        message (str): Il messaggio da inviare all'API.
        endpoint (str): L'ID del flusso.
        output_type (str): Il tipo di output.
        input_type (str): Il tipo di input.
        tweaks (dict): Configurazioni aggiuntive per l'API.

    Returns:
        dict: La risposta JSON dall'API.
    """
    api_url = f"{BASE_API_URL}/api/v1/run/{endpoint}"
    payload = {
        "input_value": message,
        "output_type": output_type,
        "input_type": input_type,
        "tweaks": tweaks
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(api_url, json=payload, headers=headers, timeout=None)
    return response.json()
