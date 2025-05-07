// Stato globale
let state = {
    currentChatId: null,
    chats: JSON.parse(localStorage.getItem('chats')) || {},
    currentAgent: null,
    isSidebarVisible: true,
};

// Elementi del DOM
const elements = {
    sidebar: document.getElementById('sidebar'),
    menuBtn: document.getElementById('menu-btn'),
    menuIcon: document.getElementById('menu-icon'),
    chatList: document.getElementById('chat-list'),
    messagesContainer: document.getElementById('messages-container'),
    welcomeContainer: document.getElementById('welcome-container'),
    welcomeContent: document.getElementById('welcome-content'),
    welcomeLogo: document.getElementById('welcome-logo'),
    chatInput: document.getElementById('chat-input'),
    messageInput: document.getElementById('message'),
    sendBtn: document.getElementById('send-btn'),
    searchBtn: document.getElementById('search-btn'),
    searchInput: document.getElementById('search-input'),
};

// Inizializza Highlight.js
document.addEventListener('DOMContentLoaded', () => {
    hljs.highlightAll();
    initializeEventListeners();
    loadInitialChat();
});

// Inizializza gli event listener
function initializeEventListeners() {
    elements.menuBtn.addEventListener('click', toggleSidebar);
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    elements.messageInput.addEventListener('input', handleInputChange);
    elements.searchBtn.addEventListener('click', toggleSearchInput);
    elements.searchInput.addEventListener('input', handleSearchInput);

    // Delegazione degli eventi per elementi dinamici
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="start-new-chat"]')) {
            startNewChat();
        }
        if (e.target.closest('[data-agent]')) {
            const agent = e.target.closest('[data-agent]').dataset.agent;
            selectAgent(agent);
        }
        if (e.target.closest('.chat-item') && !e.target.classList.contains('delete-btn')) {
            const chatId = e.target.closest('.chat-item').dataset.chatId;
            loadChat(chatId);
        }
        if (e.target.classList.contains('delete-btn')) {
            const chatId = e.target.closest('.chat-item').dataset.chatId;
            deleteChat(chatId);
        }
    });
}

// Toggle della sidebar
function toggleSidebar() {
    state.isSidebarVisible = !state.isSidebarVisible;
    elements.sidebar.classList.toggle('hidden', !state.isSidebarVisible);
    elements.menuIcon.classList.toggle('fa-bars', state.isSidebarVisible);
    elements.menuIcon.classList.toggle('fa-arrow-right', !state.isSidebarVisible);
}

// Seleziona un agente
function selectAgent(agent) {
    state.currentAgent = agent;
    const agentButtons = document.querySelectorAll('.agent-btn');
    agentButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.agent === agent);
    });
    state.chats[state.currentChatId].agent = agent;
    saveChats();
}

// Carica le chat nel sidebar
function loadChats(searchTerm = '') {
    elements.chatList.innerHTML = '';
    Object.entries(state.chats).forEach(([chatId, chat]) => {
        if (searchTerm && !chatId.includes(searchTerm)) return;
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chatId === state.currentChatId ? 'active' : ''}`;
        chatItem.dataset.chatId = chatId;
        chatItem.innerHTML = `
            <div class="flex items-center">
                <div class="icon"><i class="fas fa-comment"></i></div>
                Chat ${chatId}
            </div>
            <i class="fas fa-trash-alt delete-btn cursor-pointer"></i>
        `;
        elements.chatList.appendChild(chatItem);
    });
}

// Inizia una nuova chat
function startNewChat() {
    const chatId = Date.now().toString();
    state.chats[chatId] = { messages: [], agent: null };
    state.currentChatId = chatId;
    state.currentAgent = null;
    saveChats();
    loadChats();
    loadChat(chatId);
    resetChatView();
}

// Carica una chat specifica
function loadChat(chatId) {
    state.currentChatId = chatId;
    loadChats();
    elements.messagesContainer.innerHTML = '';
    const chat = state.chats[chatId];
    if (chat.messages.length === 0) {
        elements.welcomeContent.classList.remove('hidden');
        elements.welcomeLogo.classList.remove('animated');
        elements.chatInput.classList.add('initial');
        state.currentAgent = null;
        resetAgentSelection();
    } else {
        elements.welcomeContent.classList.add('hidden');
        elements.welcomeLogo.classList.add('animated');
        elements.chatInput.classList.remove('initial');
        state.currentAgent = chat.agent;
        updateAgentSelection();
    }
    chat.messages.forEach(msg => {
        appendMessage(msg);
    });
    scrollToBottom();
}

// Elimina una chat
function deleteChat(chatId) {
    delete state.chats[chatId];
    saveChats();
    if (chatId === state.currentChatId) {
        state.currentChatId = null;
        state.currentAgent = null;
        elements.messagesContainer.innerHTML = '';
        elements.welcomeContent.classList.remove('hidden');
        elements.welcomeLogo.classList.remove('animated');
        elements.chatInput.classList.add('initial');
        resetAgentSelection();
    }
    loadChats();
    if (Object.keys(state.chats).length > 0) {
        state.currentChatId = Object.keys(state.chats)[0];
        loadChat(state.currentChatId);
    }
}

// Invia un messaggio
async function sendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message) return;

    if (!state.currentChatId) {
        startNewChat();
    }

    if (!state.currentAgent) {
        alert("Per favore, seleziona un agente prima di inviare un messaggio.");
        return;
    }

    animateLogo();
    elements.welcomeContent.classList.add('hidden');
    elements.chatInput.classList.remove('initial');

    const userMessage = { sender: 'user', text: message, isMarkdown: false };
    state.chats[state.currentChatId].messages.push(userMessage);
    appendMessage(userMessage);

    const loadingDiv = createLoadingMessage();
    elements.messagesContainer.appendChild(loadingDiv);
    scrollToBottom();

    try {
        const response = await fetch(`/chat/${state.currentAgent}?message=${encodeURIComponent(message)}`);
        const data = await response.json();
        const botMessageText = data.message || 'Errore nella risposta';
        const botMessage = { sender: 'bot', text: botMessageText, isMarkdown: true };
        elements.messagesContainer.removeChild(loadingDiv);
        state.chats[state.currentChatId].messages.push(botMessage);
        appendMessage(botMessage);
    } catch (error) {
        elements.messagesContainer.removeChild(loadingDiv);
        const errorMessage = { sender: 'bot', text: `Errore: ${error.message}`, isMarkdown: false };
        state.chats[state.currentChatId].messages.push(errorMessage);
        appendMessage(errorMessage);
    }
    saveChats();
    elements.messageInput.value = '';
    // Aggiunto un piccolo ritardo per assicurarsi che il DOM sia aggiornato
    setTimeout(scrollToBottom, 100);
}

// Animazione del logo
function animateLogo() {
    if (!elements.welcomeContent.classList.contains('hidden')) {
        elements.welcomeLogo.classList.add('animated');
    }
}

// Ottiene l'immagine dell'avatar del bot in base all'agente
function getBotAvatar() {
    if (state.currentAgent === 'google') {
        return '<img src="/static/google.png" alt="Google Agent" class="avatar-img">';
    } else if (state.currentAgent === 'rag') {
        return '<img src="/static/rag.png" alt="RAG Agent" class="avatar-img">';
    }
    return '<i class="fas fa-robot"></i>';
}

// Funzioni di supporto
function appendMessage(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.sender}`;
    const content = msg.isMarkdown ? marked.parse(msg.text) : msg.text;
    const avatarContent = msg.sender === 'user' ? '<i class="fas fa-user"></i>' : getBotAvatar();
    messageDiv.innerHTML = `
        <div class="avatar">${avatarContent}</div>
        <div class="content">${content}</div>
    `;
    elements.messagesContainer.appendChild(messageDiv);
    messageDiv.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
}

function createLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot';
    loadingDiv.innerHTML = `
        <div class="avatar">${getBotAvatar()}</div>
        <div class="content"><span class="spinner"></span></div>
    `;
    return loadingDiv;
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function saveChats() {
    localStorage.setItem('chats', JSON.stringify(state.chats));
}

function resetChatView() {
    elements.welcomeContent.classList.remove('hidden');
    elements.welcomeLogo.classList.remove('animated');
    elements.chatInput.classList.add('initial');
    resetAgentSelection();
}

function resetAgentSelection() {
    const agentButtons = document.querySelectorAll('.agent-btn');
    agentButtons.forEach(btn => btn.classList.remove('active'));
}

function updateAgentSelection() {
    const agentButtons = document.querySelectorAll('.agent-btn');
    agentButtons.forEach(btn => {
        btn.classList.toggle('active', state.currentAgent && btn.dataset.agent === state.currentAgent);
    });
}

function handleInputChange() {
    if (!state.currentAgent) return;
    elements.welcomeContent.classList.add('hidden');
    elements.chatInput.classList.remove('initial');
}

function toggleSearchInput() {
    elements.searchInput.style.display = elements.searchInput.style.display === 'block' ? 'none' : 'block';
    if (elements.searchInput.style.display === 'block') {
        elements.searchInput.focus();
    } else {
        elements.searchInput.value = '';
        loadChats();
    }
}

function handleSearchInput(e) {
    const searchTerm = e.target.value.toLowerCase();
    loadChats(searchTerm);
}

function loadInitialChat() {
    if (Object.keys(state.chats).length === 0) {
        startNewChat(); // Inizia una nuova chat se non ce ne sono
    } else {
        state.currentChatId = Object.keys(state.chats)[0];
        loadChat(state.currentChatId);
    }
}
// Funzione per inviare un messaggio al server
async function sendMessageToServer(message, agent) {
    try {
        const endpoint = agent === 'google' ? '/chat/google' : '/chat/rag';
        const response = await fetch(`${endpoint}?message=${encodeURIComponent(message)}`);
        if (!response.ok) {
            throw new Error(`Errore HTTP! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error("Errore durante l'invio del messaggio:", error);
        return "Si è verificato un errore durante l'invio del messaggio.";
    }
}

// Funzione per gestire l'invio di un messaggio
async function sendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message) return;

    if (!state.currentChatId) {
        startNewChat();
    }

    if (!state.currentAgent) {
        alert("Per favore, seleziona un agente prima di inviare un messaggio.");
        return;
    }

    animateLogo();
    elements.welcomeContent.classList.add('hidden');
    elements.chatInput.classList.remove('initial');

    const userMessage = { sender: 'user', text: message, isMarkdown: false };
    state.chats[state.currentChatId].messages.push(userMessage);
    appendMessage(userMessage);
    elements.messageInput.value = '';
    scrollToBottom();

    const botResponse = await sendMessageToServer(message, state.currentAgent);
    const botMessage = { sender: 'bot', text: botResponse, isMarkdown: true };
    state.chats[state.currentChatId].messages.push(botMessage);
    appendMessage(botMessage);
    saveChats();
    // Aggiunto un piccolo ritardo per assicurarsi che il DOM sia aggiornato
    setTimeout(scrollToBottom, 100);
}