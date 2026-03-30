# WeatherFlow - Real-time Forecast Application ⛅️

WeatherFlow is a fully responsive, modern web application that provides real-time weather data and a 5-day extended forecast for any location worldwide. It features a sleek glassmorphic UI, dynamic weather-based background changes, and seamless usability.

Built as part of the JavaScript web development assignment.

## Features

- **Location-based Search:** Instantly get weather updates by searching for any city in the world.
- **Current Location Geolocation:** Fetch the weather for your exact location with a single click.
- **5-Day Extended Forecast:** Plan ahead with a beautiful and simple 5-day weather, humidity, and wind outlook.
- **Dynamic Backgrounds:** The application's background smoothly transitions depending on the current weather condition (e.g., cloudy, rainy, clear).
- **Recent Searches History:** Safely stores your recently searched locations locally so you can click and quickly check them again without re-typing.
- **Extreme Weather Alerts:** Custom built-in warnings whenever the temperature crosses 40°C or drops below 0°C.
- **Celsius / Fahrenheit Toggle:** Easily switch between temperature units for the current forecast.
- **Custom Error Handling:** Beautiful in-app UI error states—no annoying browser `alert()` pop-ups!

## Tech Stack

- **HTML5:** Semantic architecture and structures.
- **CSS3 / Tailwind CSS:** Utility-first framework combined with custom glassmorphism CSS, delivering a highly responsive and modern interface.
- **JavaScript (ES6+):** Pure, lightweight functional logic covering DOM manipulation, Fetch API, and asynchronous events.
- **APIs Used:**
  - **Open-Meteo API:** For accurate, free, and robust current and daily weather forecasts.
  - **Open-Meteo Geocoding API:** For robust text-to-coordinates city search.
  - **Nominatim (OpenStreetMap):** For reverse-geocoding the user's current GPS location coordinates into a readable city name.

## Setup Instructions

This application uses open and free APIs that don't require any API keys. It runs entirely on the client side, meaning you can run it right out of the box!

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Unsigned0Varchar/weather-app.git
   cd weatherflow
   ```

2. **Run the Application:**
   Because there is no build step or package manager required, you can simply open the `index.html` file in your preferred web browser:
   
   - **On MacOS:** Double click the `index.html` file, or run `open index.html` in your terminal.
   - **On Windows:** Double click the `index.html` file, or run `start index.html` in your terminal.
   
Alternatively, you can run a local development server using tools like VS Code Live Server for hot reloading.

