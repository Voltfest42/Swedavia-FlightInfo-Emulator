# Swedavia FlightInfoV2 Emulator

This project is a fully functional, dynamically generated emulation of the Swedavia FlightInfoV2 API. It includes a smart Express backend that generates realistic synthetic aviation data on the fly, and a frontend Flight Information Display System (FIDS) client.

## Features
- **Dynamic Real-Time Status Engine:** Flights automatically transition from "Scheduled" to "Go to Gate" to "Boarding" to "Departed" based on the server's real-time clock.
- **Lazy-Loading Data Generator:** Never run out of data. If you query a date that hasn't been generated yet, the server automatically generates a massive payload of highly realistic, statistically accurate flights for that specific day in the background.
- **Statistical Accuracy:** Data generation is modeled after actual Swedavia statistics for its airports, correctly weighting airlines, destinations, and rush-hour volume curves.
- **FIDS Client Interface:** A highly responsive frontend dashboard with zero-latency client-side filtering (by Airline, Time Range, Destination, etc.) and interactive, randomly generated boarding passes.

## Installation & Setup

It takes less than 30 seconds to get the emulator up and running:

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Voltfest42/Swedavia-FlightInfo-Emulator.git
   cd Swedavia-FlightInfo-Emulator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the API Server:**
   ```bash
   node server.js
   ```
   *(The server will start running on `http://localhost:3000`)*

4. **Launch the Client:**
   Simply double-click the `client.html` file in your file explorer to open it in your browser. Because the Node server handles CORS, you don't need a local web server to run the frontend!

## Usage
Once `client.html` is open, simply select an airport and date, and click **Load Flights**. If it's your first time querying that date, the server will take a brief moment to generate the synthetic flight data, and then stream it back to the UI!
