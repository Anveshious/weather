// Chatbot Elements
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotClose = document.getElementById('chatbot-close');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Chatbot State
let isChatbotOpen = false;

// Toggle Chatbot Visibility
chatbotToggle.addEventListener('click', () => {
    isChatbotOpen = !isChatbotOpen;
    chatbotContainer.classList.toggle('hidden', !isChatbotOpen);
    if (isChatbotOpen) {
        addBotMessage("Hello! I'm your weather assistant. Ask me anything about weather in any city!");
    }
});

chatbotClose.addEventListener('click', () => {
    isChatbotOpen = false;
    chatbotContainer.classList.add('hidden');
});

// Send Message Functionality
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addUserMessage(message);
    userInput.value = '';
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        // Get AI response (we'll implement this next)
        const response = await getAIResponse(message);
        // Remove typing indicator
        typingIndicator.remove();
        // Add bot response
        addBotMessage(response);
    } catch (error) {
        typingIndicator.remove();
        addBotMessage("Sorry, I'm having trouble connecting to the AI service.");
        console.error("AI Error:", error);
    }
}

// Helper Functions
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'mb-3 flex justify-end';
    messageDiv.innerHTML = `
        <div class="bg-indigo-100 text-gray-800 rounded-lg py-2 px-3 max-w-xs">
            ${text}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'mb-3 flex justify-start';
    messageDiv.innerHTML = `
        <div class="bg-gray-200 text-gray-800 rounded-lg py-2 px-3 max-w-xs">
            ${text}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'mb-3 flex justify-start';
    indicator.innerHTML = `
        <div class="bg-gray-200 text-gray-800 rounded-lg py-2 px-3 max-w-xs">
            <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
}

// AI Integration
async function getAIResponse(userMessage) {
    // First check if it's a weather question
    const weatherMatch = userMessage.match(/weather in (.+)/i);
    if (weatherMatch) {
        const city = weatherMatch[1];
        return await getWeatherSummary(city);
    }
    
    // Default AI response
    return "I can help with weather information. Try asking 'What's the weather in London?'";
}

async function getWeatherSummary(city) {
    try {
        const API_KEY = '9a9797e282ed69096475aac373915d2c'; // Replace with your key
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.cod === 200) {
            return `In ${data.name}, it's currently ${Math.round(data.main.temp)}°C with ${data.weather[0].description}. ` +
                   `Humidity is ${data.main.humidity}% and wind speed is ${Math.round(data.wind.speed * 3.6)} km/h.`;
        } else {
            return `Sorry, I couldn't find weather information for ${city}.`;
        }
    } catch (error) {
        return "I'm having trouble accessing weather data right now.";
    }
}