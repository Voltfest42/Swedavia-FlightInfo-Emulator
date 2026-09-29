const fs = require('fs');
const moment = require('moment');

const AIRLINES = [
    { iata: 'SK', icao: 'SAS', name: 'Scandinavian Airlines' },
    { iata: 'DY', icao: 'NAX', name: 'Norwegian Air Shuttle' },
    { iata: 'FR', icao: 'RYR', name: 'Ryanair' },
    { iata: 'TF', icao: 'BRX', name: 'BRA Braathens Regional Airlines' }
];

const DESTINATIONS = [
    { iata: 'LHR', swedish: 'London', english: 'London' },
    { iata: 'CPH', swedish: 'Köpenhamn', english: 'Copenhagen' },
    { iata: 'OSL', swedish: 'Oslo', english: 'Oslo' },
    { iata: 'HEL', swedish: 'Helsingfors', english: 'Helsinki' },
    { iata: 'FRA', swedish: 'Frankfurt', english: 'Frankfurt' },
    { iata: 'AMS', swedish: 'Amsterdam', english: 'Amsterdam' }
];

const AIRPORTS = ['ARN', 'GOT', 'BMA'];

function generateFlights() {
    const flights = [];
    const today = moment().startOf('day');

    for (let dayOffset = -1; dayOffset <= 2; dayOffset++) {
        const currentDay = moment(today).add(dayOffset, 'days');
        
        for (const airport of AIRPORTS) {
            // Generate arrivals and departures
            for (let i = 0; i < 50; i++) {
                const isDeparture = Math.random() > 0.5;
                const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
                const otherAirport = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
                
                const hour = Math.floor(Math.random() * 18) + 5; // 5 AM to 11 PM
                const minute = Math.floor(Math.random() * 60);
                
                const scheduledTime = moment(currentDay).hour(hour).minute(minute).second(0);
                
                const flightId = `${airline.iata}${Math.floor(Math.random() * 9000) + 100}`;
                const terminal = Math.random() > 0.5 ? '5' : '4';
                const gate = `F${Math.floor(Math.random() * 40) + 10}`;

                const flight = {
                    flightId,
                    type: isDeparture ? 'DEPARTURE' : 'ARRIVAL',
                    airport, // The Swedavia airport
                    date: currentDay.format('YYYY-MM-DD'),
                    scheduledUtc: scheduledTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
                    terminal,
                    gate,
                    airlineOperator: airline,
                    otherAirportIata: otherAirport.iata,
                    otherAirportSwedish: otherAirport.swedish,
                    otherAirportEnglish: otherAirport.english
                };
                
                flights.push(flight);
            }
        }
    }
    
    fs.writeFileSync('mock_flights.json', JSON.stringify(flights, null, 2));
    console.log('Generated mock_flights.json with ' + flights.length + ' flights.');
}

generateFlights();
