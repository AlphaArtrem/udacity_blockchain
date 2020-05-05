import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(flight)
            .send({ from: self.owner , gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, payload);
            });
    }

    registerAirlineStatus(airline, callback){
        let self = this;

        self.flightSuretyApp.methods
            .registerAirlineStatus(airline)
            .call({ from: self.owner, gas: 999999999}, (error, result) => {
                callback((error != undefined ? JSON.stringify(error.message) : error), result);
            });
    }
    
    registerAirline(airline, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .registerAirline(airline)
            .send({ from: self.owner, gas: 999999999}, (error, result) => {
                console.log(error, result)
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    voteForAirline(airline, callback) {
        let self = this;
        
        self.flightSuretyApp.methods
            .voteForAirline(airline)
            .send({ from: self.owner, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    activateAirline(airline, callback) {
        let self = this;
        
        self.flightSuretyApp.methods
            .activateAirline(airline)
            .send({ from: self.owner, value: this.web3.utils.toWei("10", "ether"), gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    registerFlight(airline, flight, timestamp, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .registerFlight(airline, flight, timestamp)
            .send({ from: self.owner, gas: 999999999}, (error, result) => {
                console.log(error); 
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    getFlight(id, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .getFlight(id)
            .call({ from: self.owner, gas: 999999999}, (error, result) => {
                console.log(error, result); 
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    getInsuranceByFlight(id, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .getInsurancesByFlight(id)
            .call({ from: self.owner, gas: 999999999}, (error, result) => {
                console.log(error, result); 
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }
        
}