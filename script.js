// ---------------------------------------------------------
// SELECTORS
// ---------------------------------------------------------

// Search Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const recentDropdown = document.getElementById('recent-dropdown');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// State Elements
const loadingSpinner = document.getElementById('loading-spinner');
const initialState = document.getElementById('initial-state');
const weatherContent = document.getElementById('weather-content');

// Alert Elements
const weatherAlert = document.getElementById('weather-alert');
const alertMessage = document.getElementById('alert-message');
const closeAlertBtn = document.getElementById('close-alert-btn');

// Current Weather Elements
const locationName = document.getElementById('location-name');
const currentDate = document.getElementById('current-date');
const currentTemp = document.getElementById('current-temp');
const currentCondition = document.getElementById('current-condition');
const currentIcon = document.getElementById('current-icon');
const currentHumidity = document.getElementById('current-humidity');
const currentWind = document.getElementById('current-wind');
const currentFeelsLike = document.getElementById('current-feels-like');
const unitCBtn = document.getElementById('unit-c');
const unitFBtn = document.getElementById('unit-f');
const appBody = document.getElementById('app-body');
const currentLocationIcon = document.getElementById('current-location-icon');

// Forecast
const forecastContainer = document.getElementById('forecast-container');

// ---------------------------------------------------------
// STATE
// ---------------------------------------------------------

let currentTempC = 0;
let isCelsius = true;
let recentSearches = JSON.parse(localStorage.getItem('weatherFlowRecent')) || [];

// WMO Weather Mapping to Descriptions and OpenWeather Icons
const WMO_MAP = {
  0:  { desc: "Clear sky", icon: "01d", bgClass: "bg-clear-day" },
  1:  { desc: "Mainly clear", icon: "02d", bgClass: "bg-clear-day" },
  2:  { desc: "Partly cloudy", icon: "03d", bgClass: "bg-cloudy" },
  3:  { desc: "Overcast", icon: "04d", bgClass: "bg-cloudy" },
  45: { desc: "Fog", icon: "50d", bgClass: "bg-foggy" },
  48: { desc: "Depositing rime fog", icon: "50d", bgClass: "bg-foggy" },
  51: { desc: "Light drizzle", icon: "10d", bgClass: "bg-rainy" },
  53: { desc: "Moderate drizzle", icon: "10d", bgClass: "bg-rainy" },
  55: { desc: "Dense drizzle", icon: "09d", bgClass: "bg-rainy" },
  56: { desc: "Light freezing drizzle", icon: "13d", bgClass: "bg-snowy" },
  57: { desc: "Dense freezing drizzle", icon: "13d", bgClass: "bg-snowy" },
  61: { desc: "Slight rain", icon: "10d", bgClass: "bg-rainy" },
  63: { desc: "Moderate rain", icon: "10d", bgClass: "bg-rainy" },
  65: { desc: "Heavy rain", icon: "09d", bgClass: "bg-rainy" },
  66: { desc: "Light freezing rain", icon: "13d", bgClass: "bg-snowy" },
  67: { desc: "Heavy freezing rain", icon: "13d", bgClass: "bg-snowy" },
  71: { desc: "Slight snow fall", icon: "13d", bgClass: "bg-snowy" },
  73: { desc: "Moderate snow fall", icon: "13d", bgClass: "bg-snowy" },
  75: { desc: "Heavy snow fall", icon: "13d", bgClass: "bg-snowy" },
  77: { desc: "Snow grains", icon: "13d", bgClass: "bg-snowy" },
  80: { desc: "Slight rain showers", icon: "09d", bgClass: "bg-rainy" },
  81: { desc: "Moderate rain showers", icon: "09d", bgClass: "bg-rainy" },
  82: { desc: "Violent rain showers", icon: "09d", bgClass: "bg-stormy" },
  85: { desc: "Slight snow showers", icon: "13d", bgClass: "bg-snowy" },
  86: { desc: "Heavy snow showers", icon: "13d", bgClass: "bg-snowy" },
  95: { desc: "Thunderstorm", icon: "11d", bgClass: "bg-stormy" },
  96: { desc: "Thunderstorm with slight hail", icon: "11d", bgClass: "bg-stormy" },
  99: { desc: "Thunderstorm with heavy hail", icon: "11d", bgClass: "bg-stormy" },
};

// ---------------------------------------------------------
// INITIALIZATION
// ---------------------------------------------------------

function init() {
  renderRecentSearches();
  
  // Event Listeners
  searchBtn.addEventListener('click', handleSearch);
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  currentLocationBtn.addEventListener('click', handleCurrentLocation);
  
  closeAlertBtn.addEventListener('click', () => {
    weatherAlert.classList.add('hidden');
  });

  unitCBtn.addEventListener('click', () => toggleUnit(true));
  unitFBtn.addEventListener('click', () => toggleUnit(false));
  
  // Keep dropdown open when focusing input
  cityInput.addEventListener('focus', () => {
    if (recentSearches.length > 0) {
      recentDropdown.classList.remove('hidden');
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !recentDropdown.contains(e.target)) {
      recentDropdown.classList.add('hidden');
    }
  });
}

// ---------------------------------------------------------
// CORE LOGIC API FETCH
// ---------------------------------------------------------

async function handleSearch() {
  const query = cityInput.value.trim();
  if (!query) {
    showError("Please enter a city name.");
    return;
  }
  
  // Hide UI, Show Loading
  hideError();
  showLoading();

  try {
    // 1. Geocode the city via Open-Meteo
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Please check spelling.");
    }
    
    const location = geoData.results[0];
    const nameStr = `${location.name}, ${location.country}`;
    
    // Add to Recent
    addToRecentSearches(nameStr);
    
    // Fetch Weather Data
    await fetchWeatherData(location.latitude, location.longitude, nameStr);
    
    currentLocationIcon.classList.add('hidden'); // Ensure geo-marker is hidden

  } catch (err) {
    showError(err.message);
    resetToInitial();
  }
}

async function handleCurrentLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }
  
  hideError();
  showLoading();
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      try {
        // Reverse Geocode using Nominatim
        const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        const revRes = await fetch(revUrl);
        const revData = await revRes.json();
        
        let city = "Unknown Location";
        if (revData.address) {
            city = revData.address.city || revData.address.town || revData.address.village || revData.address.county || "Current Location";
            city += `, ${revData.address.country_code.toUpperCase()}`;
        }
        
        await fetchWeatherData(lat, lon, city);
        currentLocationIcon.classList.remove('hidden');
        
      } catch (err) {
         showError("Could not retrieve weather for your current location.");
         resetToInitial();
      }
    },
    (err) => {
      showError("Location access denied. Please search manually.");
      resetToInitial();
    }
  );
}

async function fetchWeatherData(lat, lon, locationTitle) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&timezone=auto`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not fetch weather data from server.");
    const data = await res.json();
    
    updateUI(data, locationTitle);
  } catch (err) {
    showError(err.message);
    resetToInitial();
  }
}

// ---------------------------------------------------------
// UI UPDATES
// ---------------------------------------------------------

function updateUI(data, locationTitle) {
    const current = data.current;
    const daily = data.daily;
    const today = WMO_MAP[current.weather_code] || WMO_MAP[0];
    
    // Header Data
    locationName.textContent = locationTitle;
    
    const dateObj = new Date(current.time || new Date().toISOString());
    currentDate.textContent = dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    
    // Core Temps
    currentTempC = current.temperature_2m;
    isCelsius = true; // Default to C on new load
    updateUnitUI(); // This sets the core temperature text
    
    currentCondition.textContent = today.desc;
    currentIcon.src = `https://openweathermap.org/img/wn/${today.icon}@4x.png`;
    
    // Weather Stats
    currentHumidity.textContent = `${current.relative_humidity_2m}%`;
    currentWind.textContent = `${current.wind_speed_10m} km/h`;
    currentFeelsLike.innerHTML = `${Math.round(current.apparent_temperature)}&deg;C`;

    // Dynamic Background Update
    appBody.className = `antialiased min-h-screen transition-colors duration-1000 flex justify-center items-center py-8 px-4 sm:px-6 lg:px-8 text-white ${today.bgClass}`;

    // Extreme Temperature Alert
    if (current.temperature_2m > 40) {
      alertMessage.textContent = `Extreme Heat Warning: Temperature is currently ${Math.round(current.temperature_2m)}°C! Stay hydrated.`;
      weatherAlert.classList.remove('hidden');
    } else if (current.temperature_2m < 0) {
      alertMessage.textContent = `Freezing Temperature Warning: It is currently ${Math.round(current.temperature_2m)}°C! Dress warmly.`;
      weatherAlert.classList.remove('hidden');
    } else {
      weatherAlert.classList.add('hidden');
    }

    // Process 5-Day Forecast
    forecastContainer.innerHTML = '';
    
    // Open-Meteo daily returns arrays for each variable up to 7 days.
    // We only want index 1-5 (next 5 days) or 0-4 depending on preference. 
    // Usually, extended is index 1 to 5
    for(let i = 1; i <= 5; i++) {
        if(!daily.time[i]) break; // Guard against missing data
        
        const fDate = new Date(daily.time[i]);
        const dayStr = fDate.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const windSpd = Math.round(daily.wind_speed_10m_max[i]);
        const precip = daily.precipitation_probability_max[i];
        
        const codeMap = WMO_MAP[daily.weather_code[i]] || WMO_MAP[0];
        
        const cardHTML = `
            <div class="bg-slate-800/40 border border-glass-border rounded-xl p-4 flex flex-col items-center min-w-[120px] hover:bg-slate-700/50 transition-colors shadow-lg shrink-0">
              <span class="font-medium text-slate-200 mb-1">${dayStr}</span>
              <span class="text-xs text-slate-400 mb-2">${fDate.toLocaleDateString('en-US',{month:'numeric', day:'numeric'})}</span>
              
              <img src="https://openweathermap.org/img/wn/${codeMap.icon}@2x.png" alt="${codeMap.desc}" class="w-14 h-14 object-contain filter drop-shadow-md mb-2" />
              
              <div class="flex items-center gap-2 mb-3 w-full justify-between px-2">
                <span class="text-xs font-bold text-white text-lg">${maxTemp}&deg;</span>
                <span class="text-xs text-slate-400">${minTemp}&deg;</span>
              </div>
              
              <!-- Smaller Stats on Card -->
              <div class="w-full flex justify-between items-center text-xs text-slate-300 gap-1 opacity-80 mt-auto">
                 <div class="flex items-center gap-1" title="Humidity/Precip">
                    <i class="ph-fill ph-drop text-blue-400"></i> ${precip}%
                 </div>
                 <div class="flex items-center gap-1" title="Wind">
                    <i class="ph-fill ph-wind text-teal-400"></i> ${windSpd}
                 </div>
              </div>
            </div>
        `;
        forecastContainer.insertAdjacentHTML('beforeend', cardHTML);
    }
    
    hideLoading();
}

function toggleUnit(toCelsius) {
    if (toCelsius === isCelsius) return; // No change
    isCelsius = toCelsius;
    updateUnitUI();
}

function updateUnitUI() {
    if (isCelsius) {
        currentTemp.innerHTML = Math.round(currentTempC);
        unitCBtn.classList.replace('text-slate-400', 'text-white');
        unitCBtn.classList.replace('hover:text-white', 'bg-blue-500');
        unitCBtn.classList.add('bg-blue-500');

        unitFBtn.classList.replace('text-white', 'text-slate-400');
        unitFBtn.classList.replace('bg-blue-500', 'hover:text-white');
        unitFBtn.classList.remove('bg-blue-500');
    } else {
        const tempF = (currentTempC * 9/5) + 32;
        currentTemp.innerHTML = Math.round(tempF);
        
        unitFBtn.classList.replace('text-slate-400', 'text-white');
        unitFBtn.classList.replace('hover:text-white', 'bg-blue-500');
        unitFBtn.classList.add('bg-blue-500');

        unitCBtn.classList.replace('text-white', 'text-slate-400');
        unitCBtn.classList.replace('bg-blue-500', 'hover:text-white');
        unitCBtn.classList.remove('bg-blue-500');
    }
}

// ---------------------------------------------------------
// RECENT SEARCHES & LOCAL STORAGE
// ---------------------------------------------------------

function addToRecentSearches(city) {
    // Avoid exact duplicates
    recentSearches = recentSearches.filter(item => item.toLowerCase() !== city.toLowerCase());
    recentSearches.unshift(city); // Add to beginning
    if (recentSearches.length > 5) recentSearches.pop(); // Keep only last 5
    
    localStorage.setItem('weatherFlowRecent', JSON.stringify(recentSearches));
    renderRecentSearches();
}

function renderRecentSearches() {
    if (recentSearches.length === 0) {
        recentDropdown.innerHTML = `<li class="p-3 text-sm text-slate-500 italic">No recent searches</li>`;
        return;
    }
    
    recentDropdown.innerHTML = '';
    
    // Add Header
    const hdr = document.createElement('li');
    hdr.className = "px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-800/90 rounded-t-xl";
    hdr.textContent = "Recent Searches";
    recentDropdown.appendChild(hdr);

    recentSearches.forEach(city => {
        const li = document.createElement('li');
        li.className = "px-4 py-2.5 text-slate-200 hover:bg-slate-700/80 cursor-pointer text-sm flex items-center justify-between group border-b border-slate-700/50 last:border-0 last:rounded-b-xl transition-colors";
        li.innerHTML = `
            <span>${city}</span>
            <i class="ph ph-arrow-right text-transparent group-hover:text-blue-400 transition-colors"></i>
        `;
        li.addEventListener('click', () => {
            cityInput.value = city;
            recentDropdown.classList.add('hidden');
            handleSearch();
        });
        recentDropdown.appendChild(li);
    });
}

// ---------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------

function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000); // Auto hide after 5 seconds
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showLoading() {
    initialState.classList.add('hidden');
    weatherContent.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    weatherContent.classList.remove('hidden');
    weatherContent.classList.remove('opacity-0');
    weatherContent.classList.add('opacity-100');
}

function resetToInitial() {
    loadingSpinner.classList.add('hidden');
    weatherContent.classList.add('hidden');
    initialState.classList.remove('hidden');
}

// Invoke init
document.addEventListener('DOMContentLoaded', init);
