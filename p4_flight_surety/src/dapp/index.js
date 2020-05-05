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
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('vote-airline-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'block';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('pay-airline-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'block';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('add-flight-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'block';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('find-flight-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'block';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('insurances-flight-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'block';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('add-passenger-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'block';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('insurances-passenger-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'block';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('buy-insurance-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'block';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('claim-insurance-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'block';
            document.getElementById('check-insurance').style.display = 'none';
        });

        DOM.elid('check-insurance-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'none';
            document.getElementById('add-flight').style.display = 'none';
            document.getElementById('find-flight').style.display = 'none';
            document.getElementById('insurances-flight').style.display = 'none';
            document.getElementById('add-passenger').style.display = 'none';
            document.getElementById('insurances-passenger').style.display = 'none';
            document.getElementById('buy-insurance').style.display = 'none';
            document.getElementById('claim-insurance').style.display = 'none';
            document.getElementById('check-insurance').style.display = 'block';
        });


        // Read transaction
        contract.isOperational((error, result) => {
            const status = result ? "<p style='color : green'>Status : Operational</p>" :  "<p style='color :red'>Status : Down</p>";
            document.getElementById('isOperational').innerHTML = status;
        });

        DOM.elid('add-airline-btn').addEventListener('click', async () =>{
            let airline = DOM.elid('airline-address').value;
            let caller = DOM.elid('airline-adder-address').value;
            await contract.registerAirline(airline, caller, (error, result) => {
                document.getElementById('status-add-airline').innerHTML = error != undefined ? error.substring(67, error.length - 1): 'Tx : ' + result;
            });
            contract.registerAirlineStatus(airline, (error, result) => {
                document.getElementById('status-add-airline-2').innerHTML = error != undefined ? error.substring(67, error.length - 1) : result;
            });
        });

        DOM.elid('vote-airline-btn').addEventListener('click', async () =>{
            let airline = DOM.elid('vote-address').value;
            let caller = DOM.elid('voter-address').value;
            await contract.voteForAirline(airline, caller, (error, result) => {
                document.getElementById('status-vote-airline').innerHTML = error != undefined ? error.substring(67, error.length - 1) : 'Tx : ' + result;
            });
            contract.registerAirlineStatus(airline, (error, result) => {
                document.getElementById('status-vote-airline-2').innerHTML = error != undefined ? error.substring(67, error.length - 1) : result;
            });
        });

        DOM.elid('pay-airline-btn').addEventListener('click', async () =>{
            let airline = DOM.elid('pay-address').value;
            let caller = DOM.elid('paying-address').value;
            await contract.activateAirline(airline, caller, (error, result) => {
                document.getElementById('status-pay-airline').innerHTML = error != undefined ? error.substring(67, error.length - 1) : 'Tx : ' + result;
            });
            contract.registerAirlineStatus(airline, (error, result) => {
                document.getElementById('status-pay-airline-2').innerHTML = error != undefined ? error.substring(67, error.length - 1) : result;
            });
        });

        DOM.elid('add-flight-btn').addEventListener('click', async () =>{
            let airline = DOM.elid('flight-airline-address').value;
            let flight = DOM.elid('flight-name').value;
            let localtime = DOM.elid("flight-timestamp").value.replace('T', ' ');
            let timestamp = Math.floor(Date.parse(localtime) / 1000);
            contract.registerFlight(airline, flight, timestamp , (error, result) => {
                document.getElementById('status-add-flight').innerHTML = error != undefined ? error.substring(67, error.length - 1) : 'Tx : ' + result + '<br>' + 'Flight Added Successfully';
            });
        });

        
        DOM.elid('find-flight-btn').addEventListener('click', async () =>{
            let id = parseInt(DOM.elid('flight-id').value);
            contract.fetchFlightStatus(id, (error, result) => {});
            contract.getFlight(id , (error, result) => {
                if(result){
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

                    result = airline + flight + departure + status;
                }
                document.getElementById('status-find-flight').innerHTML = error != undefined ? error.substring(67, error.length - 1) : result ;
            });
        });

        DOM.elid('insurances-flight-btn').addEventListener('click', async () =>{
            let id = parseInt(DOM.elid('flight-insurances-id').value);
            contract.getInsuranceByFlight(id , (error, result) => {
                let list = 'Insurance Ids For This Flight ';
                if(result == undefined){
                    list = "Flight Not Found";
                }
                else if(result.length == 0){
                    list = "No Insurance Found For This Flight";
                }
                else{
                    for(let i = 0; i < result.length ; i++){
                        list = list + '<br>' + result[i];
                    }
                }
                document.getElementById('status-insurances-flight').innerHTML = error != undefined ? error.substring(67, error.length - 1) : list ;
            });
        });

        DOM.elid('add-passenger-btn').addEventListener('click', async () =>{
            let id = parseInt(DOM.elid('add-passenger-flight-id').value);
            let passenger = DOM.elid('add-passenger-address').value;
            contract.addPassengerForFlight(id ,passenger, (error, result) => {
                document.getElementById('status-add-passenger').innerHTML = error != undefined ? error.substring(67, error.length - 1) : 'Tx : ' +  result + '<br>' + 'Passenger Added Succesfully For This Flight';
            });
        });

        
        DOM.elid('insurances-passenger-btn').addEventListener('click', async () =>{
            let passenger = DOM.elid('insurances-passenger-address').value;
            contract.getInsurancesByPassenger(passenger , (error, result) => {
                let list = 'Insurance Ids For This Passenger ';
                if(result == undefined){
                    list = "Passenger Not Found";
                }
                else if(result.length == 0){
                    list = "No Insurance Found For This Passenger";
                }
                else{
                    for(let i = 0; i < result.length ; i++){
                        list = list + '<br>' + result[i];
                    }
                }
                document.getElementById('status-insurances-passenger').innerHTML = error != undefined ? error.substring(67, error.length - 1) : list ;
            });
        });

        DOM.elid('buy-insurance-btn').addEventListener('click', async () =>{
            let passenger = DOM.elid('buy-insurances-passenger-address').value;
            let flight = parseInt(DOM.elid('buy-insurances-flight-id').value);
            let amount =  parseFloat(DOM.elid('buy-insurances-amount').value);
            contract.buyInsurance(flight, passenger, amount, (error, result) => {
                document.getElementById('status-buy-insurance').innerHTML = error != undefined ? error.substring(67, error.length - 1) : 'Tx : ' + result + '<br>' + 'Insurance Bought Succesfully';
            });
        });

        DOM.elid('claim-insurance-btn').addEventListener('click', async () =>{
            let passenger = DOM.elid('claim-insurances-passenger-address').value;
            let id = parseInt(DOM.elid('claim-insurances-id').value);
            contract.claimInsurance(id, passenger, (error, result) => {
                document.getElementById('status-claim-insurance').innerHTML = error != undefined ? error.substring(67, error.length - 1) : 'Tx : ' + result + '<br>' + 'Insurance Claimed Succesfully';
            });
        });

        DOM.elid('check-insurance-btn').addEventListener('click', async () =>{
            let id = parseInt(DOM.elid('check-insurances-id').value);
            contract.checkInsurance(id, (error, result) => {
                if(result){
                    const airline = 'Insurance Id : ' + result.id + '<br>';
                    const flight = 'Flight Id : ' + result.flightId + '<br>';
                    const departure = 'Amount Paid: ' + result.amountPaid + '<br>';
                    const status = result.status;
                    result = airline + flight + departure + status;
                }
                document.getElementById('status-check-insurance').innerHTML = error != undefined ? error.substring(67, error.length - 1) :  result;
            });
        });
    
    });
    
})();





