const apiKey = "ebd2773e907cd9f85b0914452c45dff6";

let currentUnit = "metric";
function getUnitSymbol() {
    return currentUnit === "metric" ? "°C" : "°F";
}

let lastCity = "";

window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getLocationWeather(lat, lon);
        });
    }
};


const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");

searchBtn.addEventListener("click", getWeather);

const cityInput = document.getElementById("cityInput");

cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

function changeBackground(weather) {
    const bg = document.getElementById("background");
    const canvas = document.getElementById("rainCanvas");

    bg.className = "";
    isRaining = false;
    canvas.style.display = "none";  // hide rain

    if (weather.toLowerCase().includes("rain")) {
        bg.classList.add("rain");
        canvas.style.display = "block"; // show rain
        isRaining = true;
        createRain();
        animateRain();
    } 
    else if (weather.toLowerCase().includes("cloud")) {
        bg.classList.add("cloudy");
    } 
    else {
        bg.classList.add("sunny");
    }
}


async function fetchWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
const icon1 = data.weather[0].icon;

document.body.classList.remove("night");

if (icon1.includes("n")) {
    document.body.classList.add("night");
}

    if (data.cod === "404") {
        weatherResult.innerHTML = "City not found ❌";
        return;
    }

    const temperature = data.main.temp;
    const weather = data.weather[0].main;
    const humidity = data.main.humidity;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
const lat = data.coord.lat;
const lon = data.coord.lon;
getAirQuality(lat, lon);

    changeBackground(weather);

    weatherResult.innerHTML = `
        <h2>${city}</h2>
        <img src="${iconUrl}">
        <h1>${temperature}${getUnitSymbol()}</h1>
        <p>${weather}</p>
        <p>💧 Humidity: ${humidity}%</p>
    `;
}

function getWeather() {
    const city = document.getElementById("cityInput").value;

    if (city === "") {
        weatherResult.innerHTML = "Please enter a city name";
        return;
    }

    lastCity = city;
    saveCity(city);
    fetchWeatherByCity(city);
}


function getLocationWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${apiKey}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const city = data.name;
            const temperature = data.main.temp;
            const weather = data.weather[0].main;
            const humidity = data.main.humidity;
            changeBackground(weather);

            const icon = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            getAirQuality(lat, lon);

            weatherResult.innerHTML = `
                <h2>${city}</h2>
                <img src="${iconUrl}" alt="weather icon">
               <h1>${temperature}${getUnitSymbol()}</h1>
                <p>${weather}</p>
                <p>💧 Humidity: ${humidity}%</p>
            `;
        });
}
async function getAirQuality(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const aqi = data.list[0].main.aqi;

    const aqiInfo = {
        1: { text: "Good 😊", color: "#2ecc71" },
        2: { text: "Fair 🙂", color: "#f1c40f" },
        3: { text: "Moderate 😐", color: "#e67e22" },
        4: { text: "Poor 😷", color: "#e74c3c" },
        5: { text: "Very Poor ☠️", color: "#8e0000" }
    };

    const airDiv = document.getElementById("airQuality");

    airDiv.innerHTML = `<h3>Air Quality: ${aqiInfo[aqi].text}</h3>`;
    airDiv.style.background = aqiInfo[aqi].color;
}



const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let rainDrops = [];
let isRaining = false;

function createRain() {
    rainDrops = [];
    for (let i = 0; i < 300; i++) {
        rainDrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 4 + 4
        });
    }
}

function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;

    for (let drop of rainDrops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 1;

        if (drop.y > canvas.height) {
            drop.y = -20;
            drop.x = Math.random() * canvas.width;
        }
    }
}

function animateRain() {
    if (!isRaining) return;
    drawRain();
    requestAnimationFrame(animateRain);
}


document.getElementById("cBtn").onclick = () => {
    currentUnit = "metric";
    if (lastCity) fetchWeatherByCity(lastCity);
};

document.getElementById("fBtn").onclick = () => {
    currentUnit = "imperial";
    if (lastCity) fetchWeatherByCity(lastCity);
};

function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    if (!cities.includes(city)) {
        cities.unshift(city);
        if (cities.length > 5) cities.pop();
        localStorage.setItem("cities", JSON.stringify(cities));
    }
}
