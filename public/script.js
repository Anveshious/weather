require('dotenv').config(); 

const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai'); 

const app = express();
const PORT = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

document.getElementById('searchBtn').addEventListener('click', fetchWeather);
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather();
});

async function fetchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;

    showLoading(true);

    try {
        // Fetch current weather
        const currentResponse = await fetch(`/weather?city=${city}`);
        const currentData = await currentResponse.json();

        // Fetch forecast
        const forecastResponse = await fetch(`/forecast?city=${city}`);
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        generateAISummary(currentData, forecastData);

        document.getElementById('currentWeather').classList.remove('hidden');
        document.getElementById('forecast').classList.remove('hidden');
        document.getElementById('aiFeaturesBtn').classList.remove('hidden');

    } catch (error) {
        alert('Error fetching weather data');
    } finally {
        showLoading(false);
    }
}

function displayCurrentWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('currentTemp').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDesc').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
    });
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    const dailyForecasts = [];
    for (let i = 4; i < data.list.length; i += 8) {
        dailyForecasts.push(data.list[i]);
    }

    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayElement = document.createElement('div');
        dayElement.className = 'flex items-center justify-between bg-gray-50 p-3 rounded-lg';
        
        dayElement.innerHTML = `
            <div class="text-left">
                <p class="font-medium">${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <p class="text-sm text-gray-500">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" class="w-10 h-10">
            <div class="flex space-x-3">
                <span class="font-semibold">${Math.round(day.main.temp_max)}°</span>
                <span class="text-gray-500">${Math.round(day.main.temp_min)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(dayElement);
    });
}

function generateAISummary(currentData, forecastData) {
    const conditions = currentData.weather[0].description;
    const temp = Math.round(currentData.main.temp);
    const wind = Math.round(currentData.wind.speed * 3.6);
    const humidity = currentData.main.humidity;

    let summary = `Currently ${conditions} with temperatures around ${temp}°C. `;
    
    if (wind > 20) summary += `It's quite windy at ${wind} km/h. `;
    else if (wind > 10) summary += `A moderate breeze of ${wind} km/h is present. `;
    
    if (humidity > 70) summary += `The humidity is high at ${humidity}%. `;
    else if (humidity < 30) summary += `The air is quite dry with ${humidity}% humidity. `;

    document.getElementById('aiText').textContent = summary;
}

function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (show) loadingSpinner.classList.remove('hidden');
    else loadingSpinner.classList.add('hidden');
}