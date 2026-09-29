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
    'ARN': { iata: 'ARN', swedish: 'Stockholm Arlanda', english: 'Stockholm' },
    'GOT': { iata: 'GOT', swedish: 'Göteborg Landvetter', english: 'Gothenburg' },
    'BMA': { iata: 'BMA', swedish: 'Stockholm Bromma', english: 'Bromma' },
    'UME': { iata: 'UME', swedish: 'Umeå', english: 'Umea' },
    'LLA': { iata: 'LLA', swedish: 'Luleå', english: 'Lulea' },
    'MMX': { iata: 'MMX', swedish: 'Malmö', english: 'Malmo' },
    'OSD': { iata: 'OSD', swedish: 'Östersund', english: 'Ostersund' },
    'KRN': { iata: 'KRN', swedish: 'Kiruna', english: 'Kiruna' },
    'AGH': { iata: 'AGH', swedish: 'Ängelholm', english: 'Angelholm' },
    'VBY': { iata: 'VBY', swedish: 'Visby', english: 'Visby' },
    'RNB': { iata: 'RNB', swedish: 'Ronneby', english: 'Ronneby' },
    'LHR': { iata: 'LHR', swedish: 'London', english: 'London' },
    'STN': { iata: 'STN', swedish: 'London', english: 'London' },
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

const AIRPORT_PROFILES = {
    'ARN': {
        name: 'Stockholm Arlanda',
        dailyFlights: 400,
        terminals: ['2', '4', '5'],
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
        dailyFlights: 100,
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
        dailyFlights: 40,
        terminals: ['1'],
        airlines: [
            { id: 'TF', weight: 80 },
            { id: 'AY', weight: 10 }
        ],
        destinations: ['UME', 'MMX', 'AGH', 'OSD', 'HEL', 'VBY', 'RNB']
    },
    'MMX': {
        name: 'Malmö Airport',
        dailyFlights: 20,
        terminals: ['1'],
        airlines: [
            { id: 'W6', weight: 40 }, { id: 'FR', weight: 30 }, { id: 'SK', weight: 15 }, { id: 'TF', weight: 15 }
        ],
        destinations: ['ARN', 'BMA', 'STN', 'CPH', 'ALC', 'AGP']
    },
    'LLA': {
        name: 'Luleå Airport',
        dailyFlights: 15,
        terminals: ['1'],
        airlines: [
            { id: 'SK', weight: 50 }, { id: 'DY', weight: 40 }, { id: 'FR', weight: 10 }
        ],
        destinations: ['ARN', 'GOT']
    },
    'UME': {
        name: 'Umeå Airport',
        dailyFlights: 15,
        terminals: ['1'],
        airlines: [
            { id: 'SK', weight: 40 }, { id: 'DY', weight: 30 }, { id: 'TF', weight: 30 }
        ],
        destinations: ['ARN', 'BMA', 'GOT']
    },
    'OSD': {
        name: 'Åre Östersund Airport',
        dailyFlights: 5,
        terminals: ['1'],
        airlines: [
            { id: 'SK', weight: 60 }, { id: 'TF', weight: 40 }
        ],
        destinations: ['ARN', 'BMA']
    },
    'VBY': {
        name: 'Visby Airport',
        dailyFlights: 10,
        terminals: ['1'],
        airlines: [
            { id: 'TF', weight: 50 }, { id: 'SK', weight: 40 }, { id: 'FR', weight: 10 }
        ],
        destinations: ['ARN', 'BMA', 'GOT']
    },
    'RNB': {
        name: 'Ronneby Airport',
        dailyFlights: 4,
        terminals: ['1'],
        airlines: [
            { id: 'TF', weight: 50 }, { id: 'SK', weight: 50 }
        ],
        destinations: ['ARN', 'BMA']
    },
    'KRN': {
        name: 'Kiruna Airport',
        dailyFlights: 4,
        terminals: ['1'],
        airlines: [
            { id: 'SK', weight: 70 }, { id: 'DY', weight: 30 }
        ],
        destinations: ['ARN', 'UME']
    }
};

function pickWeighted(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
        if (random < item.weight) return item.id;
        random -= item.weight;
    }
    return items[0].id;
}

function generateForDate(dateString) {
    const flights = [];
    const targetDay = moment(dateString).startOf('day');

    for (const [airportCode, profile] of Object.entries(AIRPORT_PROFILES)) {
        for (let i = 0; i < profile.dailyFlights; i++) {
            const isDeparture = Math.random() > 0.5;
            const airlineId = pickWeighted(profile.airlines);
            const airline = AIRLINES[airlineId];
            const destId = profile.destinations[Math.floor(Math.random() * profile.destinations.length)];
            
            let finalDestId = destId;
            if (airlineId === 'FR' && destId === 'LHR') finalDestId = 'STN';
            if (airlineId !== 'FR' && destId === 'STN') finalDestId = 'LHR';
            const otherAirport = DESTINATIONS[finalDestId];
            
            let hour;
            const timeStrand = Math.random();
            if (timeStrand < 0.3) { hour = 6 + Math.floor(Math.random() * 4); } 
            else if (timeStrand < 0.6) { hour = 15 + Math.floor(Math.random() * 5); } 
            else { hour = 10 + Math.floor(Math.random() * 5); } 
            
            const minute = Math.floor(Math.random() * 60);
            const scheduledTime = moment(targetDay).hour(hour).minute(minute).second(0);
            
            const flightId = `${airline.iata}${Math.floor(Math.random() * 9000) + 100}`;
            const terminal = profile.terminals[Math.floor(Math.random() * profile.terminals.length)];
            const gatePrefix = terminal === '5' ? 'F' : (terminal === '4' ? 'C' : (terminal === '2' ? '6' : '1'));
            const gate = `${gatePrefix}${Math.floor(Math.random() * 10) + 1}`;

            const fateStrand = Math.random();
            let fate = 'ON_TIME';
            let delayMinutes = 0;
            
            if (fateStrand < 0.02) {
                fate = 'CANCELLED';
            } else if (fateStrand < 0.15) {
                fate = 'DELAYED';
                delayMinutes = 15 + Math.floor(Math.random() * 135);
            }

            const flight = {
                flightId,
                type: isDeparture ? 'DEPARTURE' : 'ARRIVAL',
                airport: airportCode,
                date: targetDay.format('YYYY-MM-DD'),
                scheduledUtc: scheduledTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
                terminal,
                gate,
                airlineOperator: airline,
                otherAirportIata: otherAirport.iata,
                otherAirportSwedish: otherAirport.swedish,
                otherAirportEnglish: otherAirport.english,
                fate,
                delayMinutes
            };
            
            flights.push(flight);
        }
    }
    return flights;
}

// If run directly via node generate_data.js
if (require.main === module) {
    const flights = [];
    const today = moment().startOf('day');
    for (let dayOffset = 0; dayOffset <= 0; dayOffset++) {
        const dateStr = moment(today).add(dayOffset, 'days').format('YYYY-MM-DD');
        flights.push(...generateForDate(dateStr));
    }
    fs.writeFileSync('mock_flights.json', JSON.stringify(flights, null, 2));
    console.log(`Generated mock_flights.json with ${flights.length} realistically modeled flights for today.`);
}

module.exports = { generateForDate };
