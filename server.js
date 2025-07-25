const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// OpenWeatherMap API Key
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Route to fetch weather data
app.get('/weather', async (req, res) => {
    const { city } = req.query;
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// Route to fetch forecast
app.get('/forecast', async (req, res) => {
    const { city } = req.query;
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch forecast" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


app.get('/ai-insights', async (req, res) => {
    const { weatherData } = req.query;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a weather assistant." },
                { role: "user", content: `Give a detailed weather summary for: ${weatherData}` }
            ],
        });
        res.json({ summary: response.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "AI service failed" });
    }
});