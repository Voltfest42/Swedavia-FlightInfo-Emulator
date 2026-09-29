const fs = require('fs');
const moment = require('moment');

// --- Realistic Aviation Data Mappings ---

const AIRLINES = {
    'SK': { iata: 'SK', icao: 'SAS', name: 'Scandinavian Airlines' },
    'DY': { iata: 'DY', icao: 'NAX', name: 'Norwegian Air Shuttle' },
    'FR': { iata: 'FR', icao: 'RYR', name: 'Ryanair' },
    'TF': { iata: 'TF', icao: 'BRX', name: 'BRA Braathens Regional Airlines' },
    'LH': { iata: 'LH', icao: 'DLH', name: 'Lufthansa' },
    'KL': { iata: 'KL', icao: 'KLM', name: 'KLM Royal Dutch Airlines' },
    'AY': { iata: 'AY', icao: 'FIN', name: 'Finnair' },
    'AF': { iata: 'AF', icao: 'AFR', name: 'Air France' },
    'BA': { iata: 'BA', icao: 'BAW', name: 'British Airways' },
    'W6': { iata: 'W6', icao: 'WZZ', name: 'Wizz Air' },
    'EK': { iata: 'EK', icao: 'UAE', name: 'Emirates' },
    'QR': { iata: 'QR', icao: 'QTR', name: 'Qatar Airways' }
};

const DESTINATIONS = {
    // Domestic
    'UME': { iata: 'UME', swedish: 'Umeå', english: 'Umea' },
    'LLA': { iata: 'LLA', swedish: 'Luleå', english: 'Lulea' },
    'MMX': { iata: 'MMX', swedish: 'Malmö', english: 'Malmo' },
    'OSD': { iata: 'OSD', swedish: 'Östersund', english: 'Ostersund' },
    'KRN': { iata: 'KRN', swedish: 'Kiruna', english: 'Kiruna' },
    'AGH': { iata: 'AGH', swedish: 'Ängelholm', english: 'Angelholm' },
    // International
    'LHR': { iata: 'LHR', swedish: 'London', english: 'London' },
    'STN': { iata: 'STN', swedish: 'London', english: 'London' }, // Ryanair usually
    'CPH': { iata: 'CPH', swedish: 'Köpenhamn', english: 'Copenhagen' },
    'OSL': { iata: 'OSL', swedish: 'Oslo', english: 'Oslo' },
    'HEL': { iata: 'HEL', swedish: 'Helsingfors', english: 'Helsinki' },
    'FRA': { iata: 'FRA', swedish: 'Frankfurt', english: 'Frankfurt' },
    'MUC': { iata: 'MUC', swedish: 'München', english: 'Munich' },
    'AMS': { iata: 'AMS', swedish: 'Amsterdam', english: 'Amsterdam' },
    'CDG': { iata: 'CDG', swedish: 'Paris', english: 'Paris' },
    'ALC': { iata: 'ALC', swedish: 'Alicante', english: 'Alicante' },
    'AGP': { iata: 'AGP', swedish: 'Málaga', english: 'Malaga' },
    'DXB': { iata: 'DXB', swedish: 'Dubai', english: 'Dubai' },
    'DOH': { iata: 'DOH', swedish: 'Doha', english: 'Doha' }
};

// Based on Swedavia Statistics (rough daily flight movements: arrivals + departures)
const AIRPORT_PROFILES = {
    'ARN': {
        name: 'Stockholm Arlanda',
        dailyFlights: 400, // Approx 200 dep, 200 arr
        terminals: ['2', '4', '5'],
        // Weighted distribution of airlines
        airlines: [
            { id: 'SK', weight: 35 }, { id: 'DY', weight: 20 }, { id: 'FR', weight: 15 },
            { id: 'LH', weight: 5 }, { id: 'KL', weight: 5 }, { id: 'AY', weight: 5 },
            { id: 'AF', weight: 3 }, { id: 'BA', weight: 3 }, { id: 'EK', weight: 1 }, 
            { id: 'QR', weight: 1 }
        ],
        destinations: Object.keys(DESTINATIONS)
    },
    'GOT': {
        name: 'Göteborg Landvetter',
        dailyFlights: 100, // Approx 50 dep, 50 arr
        terminals: ['1'],
        airlines: [
            { id: 'SK', weight: 25 }, { id: 'FR', weight: 25 }, { id: 'DY', weight: 15 },
            { id: 'KL', weight: 10 }, { id: 'LH', weight: 10 }, { id: 'W6', weight: 5 },
            { id: 'AY', weight: 5 }
        ],
        destinations: ['LHR', 'STN', 'CPH', 'OSL', 'HEL', 'FRA', 'MUC', 'AMS', 'ALC', 'AGP', 'MMX', 'LLA']
    },
    'BMA': {
        name: 'Bromma Stockholm',
        dailyFlights: 40, // Approx 20 dep, 20 arr
        terminals: ['1'],
        airlines: [
            { id: 'TF', weight: 80 }, // BRA dominates Bromma
            { id: 'AY', weight: 10 }
        ],
        destinations: ['UME', 'MMX', 'AGH', 'OSD', 'HEL']
    }
};

// Helper to pick a random item from a weighted array
function pickWeighted(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
        if (random < item.weight) return item.id;
        random -= item.weight;
    }
    return items[0].id;
}

function generateFlights() {
    const flights = [];
    const today = moment().startOf('day');

    for (let dayOffset = -1; dayOffset <= 2; dayOffset++) {
        const currentDay = moment(today).add(dayOffset, 'days');
        
        for (const [airportCode, profile] of Object.entries(AIRPORT_PROFILES)) {
            
            for (let i = 0; i < profile.dailyFlights; i++) {
                const isDeparture = Math.random() > 0.5;
                
                // Pick realistic airline for this airport
                const airlineId = pickWeighted(profile.airlines);
                const airline = AIRLINES[airlineId];
                
                // Pick realistic destination for this airport
                const destId = profile.destinations[Math.floor(Math.random() * profile.destinations.length)];
                
                // If Ryanair, they usually fly to STN instead of LHR
                let finalDestId = destId;
                if (airlineId === 'FR' && destId === 'LHR') finalDestId = 'STN';
                if (airlineId !== 'FR' && destId === 'STN') finalDestId = 'LHR';
                
                const otherAirport = DESTINATIONS[finalDestId];
                
                // Generate realistic bell-curve time distribution (busy morning 6-9, busy evening 16-19)
                let hour;
                const timeStrand = Math.random();
                if (timeStrand < 0.3) { hour = 6 + Math.floor(Math.random() * 4); } // 6:00 - 9:59 (Morning rush)
                else if (timeStrand < 0.6) { hour = 15 + Math.floor(Math.random() * 5); } // 15:00 - 19:59 (Evening rush)
                else { hour = 10 + Math.floor(Math.random() * 5); } // 10:00 - 14:59 (Midday lull)
                
                const minute = Math.floor(Math.random() * 60);
                const scheduledTime = moment(currentDay).hour(hour).minute(minute).second(0);
                
                const flightId = `${airline.iata}${Math.floor(Math.random() * 9000) + 100}`;
                const terminal = profile.terminals[Math.floor(Math.random() * profile.terminals.length)];
                
                // Gate logic based on terminal (Terminal 5 at ARN has F gates, T4 has C gates, etc. Simplified here)
                const gatePrefix = terminal === '5' ? 'F' : (terminal === '4' ? 'C' : (terminal === '2' ? '6' : '1'));
                const gate = `${gatePrefix}${Math.floor(Math.random() * 10) + 1}`;

                // --- Real-world Fates & Irregularities ---
                // Statistics: ~2% Cancelled, ~13% Delayed, ~85% On Time
                const fateStrand = Math.random();
                let fate = 'ON_TIME';
                let delayMinutes = 0;
                
                if (fateStrand < 0.02) {
                    fate = 'CANCELLED';
                } else if (fateStrand < 0.15) {
                    fate = 'DELAYED';
                    // Random delay between 15 mins and 2.5 hours
                    delayMinutes = 15 + Math.floor(Math.random() * 135);
                }

                const flight = {
                    flightId,
                    type: isDeparture ? 'DEPARTURE' : 'ARRIVAL',
                    airport: airportCode,
                    date: currentDay.format('YYYY-MM-DD'),
                    scheduledUtc: scheduledTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
                    terminal,
                    gate,
                    airlineOperator: airline,
                    otherAirportIata: otherAirport.iata,
                    otherAirportSwedish: otherAirport.swedish,
                    otherAirportEnglish: otherAirport.english,
                    fate, // 'ON_TIME', 'DELAYED', 'CANCELLED'
                    delayMinutes
                };
                
                flights.push(flight);
            }
        }
    }
    
    fs.writeFileSync('mock_flights.json', JSON.stringify(flights, null, 2));
    console.log(`Generated mock_flights.json with ${flights.length} realistically modeled flights.`);
}

generateFlights();
