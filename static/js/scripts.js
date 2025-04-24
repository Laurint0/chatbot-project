// Inizializza Highlight.js per la formattazione del codice
document.addEventListener('DOMContentLoaded', (event) => {
    hljs.highlightAll();
});

// Variabili globali per gestire lo stato della chat
let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('chats')) || {};
let currentAgent = null;

// Toggle della sidebar
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const menuIcon = document.getElementById('menu-icon');
let isSidebarVisible = true;
menuBtn.addEventListener('click', () => {
    isSidebarVisible = !isSidebarVisible;
    if (isSidebarVisible) {
        sidebar.classList.remove('hidden');
        menuIcon.classList.remove('fa-arrow-right');
        menuIcon.classList.add('fa-bars');
    } else {
        sidebar.classList.add('hidden');
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-arrow-right');
    }
});

// Seleziona un agente (Google o RAG)
function selectAgent(agent) {
    currentAgent = agent;
    const agentButtons = document.querySelectorAll('.agent-btn');
    agentButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(agent)) {
            btn.classList.add('active');
        }
    });
    chats[currentChatId].agent = agent;
    localStorage.setItem('chats', JSON.stringify(chats));
}

// Carica le chat salvate dal localStorage
function loadChats(searchTerm = '') {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
    Object.keys(chats).forEach(chatId => {
        if (searchTerm && !chatId.includes(searchTerm)) return;
        const chat = chats[chatId];
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chatId === currentChatId ? 'active' : ''}`;
        chatItem.innerHTML = `
            <div class="flex items-center">
                <div class="icon"><i class="fas fa-comment"></i></div>
                Chat ${chatId}
            </div>
            <i class="fas fa-trash-alt delete-btn cursor-pointer"></i>
        `;
        chatItem.onclick = (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                loadChat(chatId);
            }
        };
        chatItem.querySelector('.delete-btn').onclick = (e) => deleteChat(e, chatId);
        chatList.appendChild(chatItem);
    });
}

// Inizia una nuova chat
function startNewChat() {
    const chatId = Date.now().toString();
    chats[chatId] = { messages: [], agent: null };
    currentChatId = chatId;
    currentAgent = null;
    localStorage.setItem('chats', JSON.stringify(chats));
    loadChats();
    loadChat(chatId);
    // Mostra il messaggio di benvenuto e centra l'input
    const welcomeContainer = document.getElementById('welcome-container');
    welcomeContainer.classList.remove('hidden');
    const chatInput = document.getElementById('chat-input');
    chatInput.classList.add('initial');
    // Resetta la selezione dell'agente
    const agentButtons = document.querySelectorAll('.agent-btn');
    agentButtons.forEach(btn => btn.classList.remove('active'));
}

// Carica una chat specifica
function loadChat(chatId) {
    currentChatId = chatId;
    loadChats();
    const messagesDiv = document.getElementById('messages-container');
    const welcomeContainer = document.getElementById('welcome-container');
    const chatInput = document.getElementById('chat-input');
    messagesDiv.innerHTML = '';
    const chat = chats[chatId];
    if (chat.messages.length === 0) {
        welcomeContainer.classList.remove('hidden');
        chatInput.classList.add('initial');
        currentAgent = null;
        // Resetta la selezione dell'agente
        const agentButtons = document.querySelectorAll('.agent-btn');
        agentButtons.forEach(btn => btn.classList.remove('active'));
    } else {
        welcomeContainer.classList.add('hidden');
        chatInput.classList.remove('initial');
        currentAgent = chat.agent;
        // Aggiorna la selezione dell'agente
        const agentButtons = document.querySelectorAll('.agent-btn');
        agentButtons.forEach(btn => {
            btn.classList.remove('active');
            if (currentAgent && btn.textContent.toLowerCase().includes(currentAgent)) {
                btn.classList.add('active');
            }
        });
    }
    chat.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender}`;
        const content = msg.isMarkdown ? marked.parse(msg.text) : msg.text;
        messageDiv.innerHTML = `
            <div class="avatar">${msg.sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'}</div>
            <div class="content">${content}</div>
        `;
        messagesDiv.appendChild(messageDiv);
        // Riformatta i blocchi di codice
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Elimina una chat
function deleteChat(event, chatId) {
    event.stopPropagation();
    delete chats[chatId];
    localStorage.setItem('chats', JSON.stringify(chats));
    if (chatId === currentChatId) {
        currentChatId = null;
        currentAgent = null;
        const messagesDiv = document.getElementById('messages-container');
        messagesDiv.innerHTML = '';
        const welcomeContainer = document.getElementById('welcome-container');
        welcomeContainer.classList.remove('hidden');
        const chatInput = document.getElementById('chat-input');
        chatInput.classList.add('initial');
        // Resetta la selezione dell'agente
        const agentButtons = document.querySelectorAll('.agent-btn');
        agentButtons.forEach(btn => btn.classList.remove('active'));
    }
    loadChats();
    if (Object.keys(chats).length > 0) {
        currentChatId = Object.keys(chats)[0];
        loadChat(currentChatId);
    }
}

// Invia un messaggio all'API selezionata (Google o RAG)
async function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    if (!message) return;

    if (!currentChatId) {
        startNewChat();
    }

    if (!currentAgent) {
        alert("Per favore, seleziona un agente prima di inviare un messaggio.");
        return;
    }

    // Nascondi il messaggio di benvenuto e riposiziona l'input
    const welcomeContainer = document.getElementById('welcome-container');
    welcomeContainer.classList.add('hidden');
    const chatInput = document.getElementById('chat-input');
    chatInput.classList.remove('initial');

    const messagesDiv = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="avatar"><i class="fas fa-user"></i></div>
        <div class="content">${message}</div>
    `;
    messagesDiv.appendChild(messageDiv);
    chats[currentChatId].messages.push({ sender: 'user', text: message, isMarkdown: false });

    // Aggiungi uno spinner di caricamento
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot';
    loadingDiv.innerHTML = `
        <div class="avatar"><i class="fas fa-robot"></i></div>
        <div class="content"><span class="spinner"></span></div>
    `;
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        let response;
        if (currentAgent === 'google') {
            response = await fetch(`/chat/google?message=${encodeURIComponent(message)}`);
        } else if (currentAgent === 'rag') {
            response = await fetch(`/chat/rag?message=${encodeURIComponent(message)}`);
        }
        const data = await response.json();
        const botMessage = data.message || 'Errore nella risposta';
        messagesDiv.removeChild(loadingDiv); // Rimuovi lo spinner
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot';
        botMessageDiv.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">${marked.parse(botMessage)}</div>
        `;
        messagesDiv.appendChild(botMessageDiv);
        chats[currentChatId].messages.push({ sender: 'bot', text: botMessage, isMarkdown: true });
        // Riformatta i blocchi di codice
        botMessageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    } catch (error) {
        messagesDiv.removeChild(loadingDiv);
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot';
        botMessageDiv.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">Errore: ${error.message}</div>
        `;
        messagesDiv.appendChild(botMessageDiv);
    }
    localStorage.setItem('chats', JSON.stringify(chats));
    messageInput.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Gestisci l'invio del messaggio
document.getElementById('send-btn').addEventListener('click', sendMessage);

// Invia premendo "Enter"
document.getElementById('message').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

// Riposiziona l'input quando l'utente inizia a scrivere
document.getElementById('message').addEventListener('input', () => {
    const welcomeContainer = document.getElementById('welcome-container');
    const chatInput = document.getElementById('chat-input');
    if (!currentAgent) return;
    welcomeContainer.classList.add('hidden');
    chatInput.classList.remove('initial');
});

// Toggle campo di ricerca
document.getElementById('search-btn').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input');
    searchInput.style.display = searchInput.style.display === 'block' ? 'none' : 'block';
    if (searchInput.style.display === 'block') {
        searchInput.focus();
    } else {
        searchInput.value = '';
        loadChats();
    }
});

// Filtra le chat in base alla ricerca
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    loadChats(searchTerm);
});

// Carica le chat all'avvio
if (Object.keys(chats).length > 0) {
    currentChatId = Object.keys(chats)[0];
    loadChat(currentChatId);
} else {
    startNewChat();
}
