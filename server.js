const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

// Load generated data
let allFlights = [];
try {
    allFlights = JSON.parse(fs.readFileSync('mock_flights.json', 'utf8'));
} catch (err) {
    console.error("Could not load mock_flights.json. Run 'node generate_data.js' first.");
    process.exit(1);
}

// 1. Departures Endpoint
app.get('/flightinfo/v2/:airportIATA/Departures/:date', (req, res) => {
    const { airportIATA, date } = req.params;
    
    // Filter flights for this airport, date, and type
    const flights = allFlights.filter(f => 
        f.airport.toUpperCase() === airportIATA.toUpperCase() && 
        f.date === date && 
        f.type === 'DEPARTURE'
    );

    // Map to FlightInfoV2 Departures schema
    const response = {
        from: {
            departureAirportIata: airportIATA.toUpperCase(),
            flightDepartureDate: date
        },
        numberOfFlights: flights.length,
        flights: flights.map(f => ({
            flightId: f.flightId,
            arrivalAirportSwedish: f.otherAirportSwedish,
            arrivalAirportEnglish: f.otherAirportEnglish,
            airlineOperator: f.airlineOperator,
            departureTime: {
                scheduledUtc: f.scheduledUtc,
                estimatedUtc: f.scheduledUtc, // Simplification for mock
                actualUtc: null
            },
            locationAndStatus: {
                terminal: f.terminal,
                gate: f.gate,
                flightLegStatus: 'SCH',
                flightLegStatusEnglish: 'Scheduled',
                flightLegStatusSwedish: 'Schemalagd'
            },
            diIndicator: 'I' // International
        }))
    };

    res.json(response);
});

// 2. Arrivals Endpoint
app.get('/flightinfo/v2/:airportIATA/Arrivals/:date', (req, res) => {
    const { airportIATA, date } = req.params;
    
    // Filter flights for this airport, date, and type
    const flights = allFlights.filter(f => 
        f.airport.toUpperCase() === airportIATA.toUpperCase() && 
        f.date === date && 
        f.type === 'ARRIVAL'
    );

    // Map to FlightInfoV2 Arrivals schema
    const response = {
        to: {
            arrivalAirportIata: airportIATA.toUpperCase(),
            flightArrivalDate: date
        },
        numberOfFlights: flights.length,
        flights: flights.map(f => ({
            flightId: f.flightId,
            departureAirportSwedish: f.otherAirportSwedish,
            departureAirportEnglish: f.otherAirportEnglish,
            airlineOperator: f.airlineOperator,
            arrivalTime: {
                scheduledUtc: f.scheduledUtc,
                estimatedUtc: f.scheduledUtc, // Simplification for mock
                actualUtc: null
            },
            locationAndStatus: {
                terminal: f.terminal,
                gate: f.gate,
                flightLegStatus: 'SCH',
                flightLegStatusEnglish: 'Scheduled',
                flightLegStatusSwedish: 'Schemalagd'
            },
            diIndicator: 'I'
        }))
    };

    res.json(response);
});

// 3. HeartBeat Emulator
// The Swedavia API uses this for liveness checks. Since it returns a generic 200 OK object, we emulate that here.
app.get('/flightinfo/v2/HeartBeat', (req, res) => {
    res.status(200).json({});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Swedavia FlightInfoV2 Emulator running on port ${PORT}`);
    console.log(`- GET http://localhost:${PORT}/flightinfo/v2/ARN/Departures/2026-09-28`);
    console.log(`- GET http://localhost:${PORT}/flightinfo/v2/ARN/Arrivals/2026-09-28`);
    console.log(`- GET http://localhost:${PORT}/flightinfo/v2/HeartBeat`);
});
