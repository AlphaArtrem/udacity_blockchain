import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        DOM.elid('add-airline-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'block';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
        });

        DOM.elid('vote-airline-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'block';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
        });

        DOM.elid('pay-airline-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'block';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
        });

        DOM.elid('add-flight-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'block';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
        });

        DOM.elid('find-flight-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'block';
            document.getElementById('insurances-flight').style.display = 'none';
        });

        DOM.elid('insurances-flight-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'block';
        });

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            const status = result ? "<p style='color : green'>Status : Operational</p>" :  "<p style='color :red'>Status : Down</p>";
            document.getElementById('isOperational').innerHTML = status;
        });

        DOM.elid('add-airline-btn').addEventListener('click', async () =>{
            let airline = DOM.elid('airline-address').value;
            contract.registerAirline(airline, (error, result) => {
                document.getElementById('status-add-airline').innerHTML = error != undefined ? error : 'Tx : ' + result;
            });
        });

        DOM.elid('vote-airline-btn').addEventListener('click', async () =>{
            let airline = DOM.elid('vote-address').value;
            contract.voteForAirline(airline, (error, result) => {
                document.getElementById('status-vote-airline').innerHTML = error != undefined ? error : 'Tx : ' + result;
            });
        });

        DOM.elid('pay-airline-btn').addEventListener('click', async () =>{
            let airline = DOM.elid('pay-address').value;
            contract.activateAirline(airline, (error, result) => {
                document.getElementById('status-pay-airline').innerHTML = error != undefined ? error : 'Tx : ' + result;
            });
        });

        DOM.elid('add-flight-btn').addEventListener('click', async () =>{
            let airline = DOM.elid('flight-airline-address').value;
            let flight = DOM.elid('flight-name').value;
            let localtime = DOM.elid("flight-timestamp").value.replace('T', ' ');
            let timestamp = Math.floor(Date.parse(localtime) / 1000);
            console.log(timestamp);
            contract.registerFlight(airline, flight, timestamp , (error, result) => {
                document.getElementById('status-add-flight').innerHTML = error != undefined ? error : 'Tx : ' + result;
            });
        });

        
        DOM.elid('find-flight-btn').addEventListener('click', async () =>{
            let id = parseInt(DOM.elid('flight-id').value);
            contract.getFlight(id , (error, result) => {
                const airline = 'Airline : ' + result[0] + '<br>';
                const flight = 'Flight : ' + result[1] + '<br>';
                const departure = 'Departure: ' + Date(parseInt(result[2])) + '<br>';
                let status = parseInt(result[3]);
                if(status == 0){
                    status = 'Status : ' + 'Uknown';
                }
                else if(status == 10){
                    status = 'Status : ' + 'On Time';
                }
                else if(status == 20){
                    status = 'Status : ' + 'Late Due To Airline';
                }
                else if(status == 30){
                    status = 'Status : ' + 'Late Due To Weather';
                }
                else if(status == 40){
                    status = 'Status : ' + 'Late Due To Technical Reasons';
                }
                else if(status == 50){
                    status = 'Status : ' + 'Late';
                }
                document.getElementById('status-find-flight').innerHTML = error != undefined ? error : airline + flight + departure + status ;
            });
            contract.fetchFlightStatus(id, (error, result) => {
                console.log({ label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp});
            });
        });

        DOM.elid('insurances-flight-btn').addEventListener('click', async () =>{
            let id = parseInt(DOM.elid('flight-insurances-id').value);
            contract.getInsuranceByFlight(id , (error, result) => {
                let list = 'Insurance Ids For This Flight ';
                if(result.length == 0){
                    list = "No Insurance Found For This Flight";
                }
                else{
                    for(let i = 0; i < result.length ; i++){
                        list = list + '<br>' + result[i];
                    }
                }
                document.getElementById('status-insurances-flight').innerHTML = error != undefined ? error : list ;
            });
        });
    
    });
    
})();





