
// Distance calculator
let airportsJSON;
let [mapMarker1, mapMarker2] = [null, null]; // store map markers here to remove after every new distance is calculated

class DistanceCalculator {
    constructor() {
        this.getAirportsJSON();
        this.currentView = 'input';
        this.distanceCalculatorEl = document.querySelector('.distance-calculator');
        this.airport1InputEl = document.querySelector('input[list="first-airport"]');
        this.airport2InputEl = document.querySelector('input[list="second-airport"]');
        this.outputDistance = document.querySelector('.output-distance');
        this.outputP = document.querySelector('.output-p');
        document.querySelector('.calculator-action-btn').addEventListener('click', this.actionBtnClicked);
    }

    getAirportsJSON = () => {
        // Get airports JSON file, and add options elements to datalists
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('GET', '/sympler-assignment/data/airports.json');
        xhr.onload = function() {
            if (xhr.readyState === 4) {
                const airpJSON = xhr.response;
                const firstAirportDL = document.querySelector('#first-airport');
                const secondAirportDL = document.querySelector('#second-airport');
                let airportOptionsTags = '';
                // add options to datalists
                for(let i = 0; i < airpJSON.length; i++) {
                    if( airpJSON[i].country === 'United States' ) {
                        airportOptionsTags += `<option value="${airpJSON[i].name}"></option>`;
                    }
                }
                // inset options HTML to datalists
                firstAirportDL.insertAdjacentHTML('beforeend', airportOptionsTags);
                secondAirportDL.insertAdjacentHTML('beforeend', airportOptionsTags);
                airportsJSON = airpJSON; // Store json object in global 'airportsJSON' variable
            }
        }
        xhr.send();
    }

    changeView = () => {
        let currentView = this.currentView === 'input' ? 'output' : 'input';
        let actionBtnValue;
        this.currentView = currentView;
        if( this.currentView == 'output' ) {
            actionBtnValue = 'Select Two other Airports'
            this.distanceCalculatorEl.classList.add('output-active');
            this.distanceCalculatorEl.classList.remove('input-active');
        } else {
            actionBtnValue = 'Submit to Get Distance';
            this.distanceCalculatorEl.classList.add('input-active');
            this.distanceCalculatorEl.classList.remove('output-active');
        }
        event.target.textContent = actionBtnValue; // update button text
    }

    validateSelectedAirports = (airport1InputVal, airport2InputVal, airport1Obj, airport2Obj) => {
        if( airport1InputVal !== '' && airport2InputVal !== '' && airport1InputVal !== undefined ) {
            if( typeof airport1Obj === 'object' && typeof airport2Obj === 'object' ) {
                if( airport1Obj !== airport2Obj) {
                    return true;
                } else {
                    alert('Please select two different airports.');
                    return false;
                }
            } else {
                alert('One or more of the selected airports was not found.');
                return false;
            }
        } else {
            alert('Please select two airports.');
            return false;
        }
    }

    calculatorOutput = (airport1Obj, airport2Obj) => {
        const [A1Lat, A1Lon, A2Lat, A2Lon] = [Number(airport1Obj.lat), Number(airport1Obj.lon), Number(airport2Obj.lat), Number(airport2Obj.lon)];
        const A1LatLng1 = new google.maps.LatLng(A1Lat, A1Lon);
        const A2LatLng2 = new google.maps.LatLng(A2Lat, A2Lon);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(A1LatLng1, A2LatLng2) / 1852 | 0; // compute distance using google maps API & convert to nautical miles
        this.outputDistance.textContent = `${distance} Nautical Miles`;
        this.outputP.innerHTML = `Is the approximate distance between <strong>${airport1Obj.name}</strong> and <strong>${airport2Obj.name}</strong>`;
        // clear previous markers
        if( mapMarker1 !== null || mapMarker2 !== null ) {
            mapMarker1.setMap(null);
            mapMarker2.setMap(null);
        }
        // airport 1 marker
        mapMarker1 = new google.maps.Marker({
            position: {lat: A1Lat, lng: A1Lon},
            map: map
        });
        // airport 2 marker
        mapMarker2 = new google.maps.Marker({
            position: {lat: A2Lat, lng: A2Lon},
            map: map
        });
        // fit markers in map
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(A1LatLng1);
        bounds.extend(A2LatLng2);
        map.fitBounds(bounds)
    }

    actionBtnClicked = (event) => {
        const airport1InputVal = this.airport1InputEl.value;
        const airport2InputVal = this.airport2InputEl.value;
        const airport1Obj = airportsJSON.find(x => x.name === airport1InputVal);
        const airport2Obj = airportsJSON.find(x => x.name === airport2InputVal);
        // validate and change view
        if( this.currentView === 'input' && this.validateSelectedAirports(airport1InputVal, airport2InputVal, airport1Obj, airport2Obj) ) {
            this.changeView();
            this.calculatorOutput(airport1Obj, airport2Obj);
        } else if( this.currentView === 'output' ) {
            this.changeView();
        }
    }
}

const DC = new DistanceCalculator();