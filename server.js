const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const { generateForDate } = require('./generate_data.js');

// Helper to load flights dynamically
function getFlightsForDate(airport, type, targetDate) {
    let allFlights = [];
    try {
        allFlights = JSON.parse(fs.readFileSync('mock_flights.json', 'utf8'));
    } catch (err) {
        console.error("Could not load mock_flights.json. Creating fresh array.");
    }

    // Check if we have flights for this exact date
    const hasData = allFlights.some(f => f.date === targetDate);
    
    if (!hasData) {
        console.log(`No data found for ${targetDate}. Generating dynamically...`);
        const newFlights = generateForDate(targetDate);
        allFlights = allFlights.concat(newFlights);
        fs.writeFileSync('mock_flights.json', JSON.stringify(allFlights, null, 2));
    }

    return allFlights.filter(f => 
        f.airport.toUpperCase() === airport.toUpperCase() && 
        f.date === targetDate && 
        f.type === type
    );
}

// Helper to calculate dynamic status based on real-world time
function computeDynamicStatus(flight, now) {
    const scheduledTime = new Date(flight.scheduledUtc);
    let estimatedTime = new Date(scheduledTime.getTime() + (flight.delayMinutes * 60000));
    
    // Base object to return
    const result = {
        flightLegStatus: 'SCH',
        flightLegStatusEnglish: 'Scheduled',
        flightLegStatusSwedish: 'Schemalagd',
        estimatedUtc: flight.fate === 'DELAYED' ? estimatedTime.toISOString() : scheduledTime.toISOString()
    };

    if (flight.fate === 'CANCELLED') {
        result.flightLegStatus = 'CAN';
        result.flightLegStatusEnglish = 'Cancelled';
        result.flightLegStatusSwedish = 'Inställd';
        return result;
    }

    const diffMinutes = (now - estimatedTime) / 60000;

    if (flight.type === 'DEPARTURE') {
        if (diffMinutes >= 0) {
            result.flightLegStatus = 'DEP';
            result.flightLegStatusEnglish = 'Departed';
            result.flightLegStatusSwedish = 'Avgått';
        } else if (diffMinutes >= -30) { // 30 mins before departure
            result.flightLegStatus = 'BRD';
            result.flightLegStatusEnglish = 'Boarding';
            result.flightLegStatusSwedish = 'Ombordstigning';
        } else if (diffMinutes >= -60) { // 60 mins before departure
            result.flightLegStatus = 'GTG';
            result.flightLegStatusEnglish = 'Go to gate';
            result.flightLegStatusSwedish = 'Gå till gate';
        } else if (flight.fate === 'DELAYED') {
            result.flightLegStatus = 'DEL';
            result.flightLegStatusEnglish = 'Delayed';
            result.flightLegStatusSwedish = 'Försenad';
        }
    } else {
        // ARRIVAL
        if (diffMinutes >= 0) {
            result.flightLegStatus = 'LAN';
            result.flightLegStatusEnglish = 'Landed';
            result.flightLegStatusSwedish = 'Landad';
        } else if (flight.fate === 'DELAYED') {
            result.flightLegStatus = 'DEL';
            result.flightLegStatusEnglish = 'Delayed';
            result.flightLegStatusSwedish = 'Försenad';
        }
    }

    return result;
}

// 1. Departures Endpoint
app.get('/flightinfo/v2/:airportIATA/Departures/:date', (req, res) => {
    const { airportIATA, date } = req.params;
    const now = new Date();
    
    const flights = getFlightsForDate(airportIATA, 'DEPARTURE', date);

    const response = {
        from: {
            departureAirportIata: airportIATA.toUpperCase(),
            flightDepartureDate: date
        },
        numberOfFlights: flights.length,
        flights: flights.map(f => {
            const statusInfo = computeDynamicStatus(f, now);
            
            return {
                flightId: f.flightId,
                arrivalAirportSwedish: f.otherAirportSwedish,
                arrivalAirportEnglish: f.otherAirportEnglish,
                airlineOperator: f.airlineOperator,
                departureTime: {
                    scheduledUtc: f.scheduledUtc,
                    estimatedUtc: statusInfo.estimatedUtc,
                    actualUtc: null
                },
                locationAndStatus: {
                    terminal: f.terminal,
                    gate: statusInfo.flightLegStatus === 'CAN' ? '-' : f.gate,
                    flightLegStatus: statusInfo.flightLegStatus,
                    flightLegStatusEnglish: statusInfo.flightLegStatusEnglish,
                    flightLegStatusSwedish: statusInfo.flightLegStatusSwedish
                },
                diIndicator: 'I' 
            };
        })
    };

    res.json(response);
});

// 2. Arrivals Endpoint
app.get('/flightinfo/v2/:airportIATA/Arrivals/:date', (req, res) => {
    const { airportIATA, date } = req.params;
    const now = new Date();
    
    const flights = getFlightsForDate(airportIATA, 'ARRIVAL', date);

    const response = {
        to: {
            arrivalAirportIata: airportIATA.toUpperCase(),
            flightArrivalDate: date
        },
        numberOfFlights: flights.length,
        flights: flights.map(f => {
            const statusInfo = computeDynamicStatus(f, now);
            
            return {
                flightId: f.flightId,
                departureAirportSwedish: f.otherAirportSwedish,
                departureAirportEnglish: f.otherAirportEnglish,
                airlineOperator: f.airlineOperator,
                arrivalTime: {
                    scheduledUtc: f.scheduledUtc,
                    estimatedUtc: statusInfo.estimatedUtc,
                    actualUtc: null
                },
                locationAndStatus: {
                    terminal: f.terminal,
                    gate: statusInfo.flightLegStatus === 'CAN' ? '-' : f.gate,
                    flightLegStatus: statusInfo.flightLegStatus,
                    flightLegStatusEnglish: statusInfo.flightLegStatusEnglish,
                    flightLegStatusSwedish: statusInfo.flightLegStatusSwedish
                },
                diIndicator: 'I'
            };
        })
    };

    res.json(response);
});

// 3. HeartBeat Emulator
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
