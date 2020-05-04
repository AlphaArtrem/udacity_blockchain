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
        });

        DOM.elid('vote-airline-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'block';
            document.getElementById('pay-airline').style.display = 'none';
        });

        DOM.elid('pay-airline-bar').addEventListener('click', () => {
            document.getElementById('add-airline').style.display = 'none';
            document.getElementById('vote-airline').style.display = 'none';
            document.getElementById('pay-airline').style.display = 'block';
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
    
    });
    

})();





