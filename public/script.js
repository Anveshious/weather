// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const loadingSpinner = document.getElementById('loading-spinner');

// API Configuration
const API_KEY = '9a9797e282ed69096475aac373915d2c'; // Replace with your key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Event Listeners
searchBtn.addEventListener('click', fetchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather();
});

async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) return;

    showLoading(true);
    clearDisplay();

    try {
        const [currentData, forecastData] = await Promise.all([
            getWeatherData('weather', city),
            getWeatherData('forecast', city)
        ]);

        renderWeather(currentData, forecastData);
    } catch (error) {
        showError(error);
    } finally {
        showLoading(false);
    }
}

async function getWeatherData(endpoint, city) {
    const response = await fetch(
        `${BASE_URL}/${endpoint}?q=${city}&units=metric&appid=${API_KEY}`
    );
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
}

function renderWeather(current, forecast) {
    weatherDisplay.innerHTML = `
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold">${current.name}, ${current.sys.country}</h2>
            <div class="flex justify-center items-center my-4">
                <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" 
                     alt="${current.weather[0].description}" class="w-24 h-24">
                <div class="text-left ml-4">
                    <p class="text-5xl font-bold">${Math.round(current.main.temp)}°C</p>
                    <p class="capitalize">${current.weather[0].description}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mt-6">
                <div class="bg-white/10 p-3 rounded-xl">
                    <p><i class="fas fa-tint mr-1"></i> Humidity</p>
                    <p class="text-xl font-bold mt-1">${current.main.humidity}%</p>
                </div>
                <div class="bg-white/10 p-3 rounded-xl">
                    <p><i class="fas fa-wind mr-1"></i> Wind</p>
                    <p class="text-xl font-bold mt-1">${Math.round(current.wind.speed * 3.6)} km/h</p>
                </div>
                <div class="bg-white/10 p-3 rounded-xl">
                    <p><i class="fas fa-temperature-low mr-1"></i> Feels</p>
                    <p class="text-xl font-bold mt-1">${Math.round(current.main.feels_like)}°C</p>
                </div>
            </div>
        </div>

        <div class="mb-6">
            <h3 class="font-bold mb-3 flex items-center">
                <i class="fas fa-calendar-alt mr-2"></i> 5-Day Forecast
            </h3>
            <div id="forecast-container" class="space-y-3"></div>
        </div>
    `;

    // Render forecast
    const forecastContainer = document.getElementById('forecast-container');
    forecast.list.filter((_, i) => i % 8 === 0).forEach(day => {
        const date = new Date(day.dt * 1000);
        forecastContainer.innerHTML += `
            <div class="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                <div class="text-left">
                    <p class="font-medium">${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                </div>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" class="w-10 h-10">
                <div class="flex space-x-3">
                    <span class="font-bold">${Math.round(day.main.temp_max)}°</span>
                    <span class="opacity-70">${Math.round(day.main.temp_min)}°</span>
                </div>
            </div>
        `;
    });

    weatherDisplay.classList.remove('hidden');
}

// Helper Functions
function showLoading(show) {
    loadingSpinner.classList.toggle('hidden', !show);
}

function clearDisplay() {
    weatherDisplay.classList.add('hidden');
    weatherDisplay.innerHTML = '';
}

function showError(error) {
    weatherDisplay.innerHTML = `
        <div class="text-center text-red-300 p-4 bg-white/10 rounded-xl">
            <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <p>${error.message || 'Failed to fetch weather data'}</p>
        </div>
    `;
    weatherDisplay.classList.remove('hidden');
}