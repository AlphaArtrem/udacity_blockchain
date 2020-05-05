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
            .call
            ({ from: self.owner}, callback);
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
            .send
            ({ from: self.owner , gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, payload);
            });
    }

    registerAirlineStatus(airline, callback){
        let self = this;

        self.flightSuretyApp.methods
            .registerAirlineStatus(airline)
            .call
            ({ from: self.owner, gas: 999999999}, (error, result) => {
                callback((error != undefined ? JSON.stringify(error.message) : error), result);
            });
    }
    
    registerAirline(airline, caller, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .registerAirline(airline)
            .send
            ({ from: caller, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    voteForAirline(airline, caller, callback) {
        let self = this;
        
        self.flightSuretyApp.methods
            .voteForAirline(airline)
            .send
            ({ from: caller, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    activateAirline(airline, caller, callback) {
        let self = this;
        
        self.flightSuretyApp.methods
            .activateAirline(airline)
            .send
            ({ from: caller, value: this.web3.utils.toWei("10", "ether"), gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    registerFlight(airline, flight, timestamp, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .registerFlight(airline, flight, timestamp)
            .send
            ({ from: airline, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    getFlight(id, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .getFlight(id)
            .call
            ({ from: self.owner, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    getInsuranceByFlight(id, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .getInsurancesByFlight(id)
            .call
            ({ from: self.owner, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    addPassengerForFlight(id, passenger, callback){
        let self = this;

        self.flightSuretyApp.methods
            .addPassengerForFlight(id, passenger)
            .send
            ({ from: self.owner, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    getInsurancesByPassenger(passenger, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .getInsurancesByPassenger(passenger)
            .call
            ({ from: self.owner, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    
    buyInsurance(flight, passenger, amount, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .buyInsurance(flight, passenger)
            .send
            ({ from: passenger, gas: 999999999, value: this.web3.utils.toWei(amount.toString(), "ether")}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }
    
    claimInsurance(id, passenger, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .claimInsurance(id)
            .send
            ({ from: passenger, gas: 999999999}, (error, result) => {
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }

    checkInsurance(id, callback){
        let self = this;
        self.flightSuretyApp.methods
            .getInsuranceById(id)
            .call
            ({ from: self.owner, gas: 999999999}, (error, result) => {
                if(result){
                    const statusCode = parseInt(result[2]);
                    result = {
                        id: result[0],
                        flightId: result[1],
                        amountPaid: this.web3.utils.fromWei(result[3], 'ether') + ' Ether',
                        owner: result[4],
                    };
                    if(statusCode == 0){
                        result.status = 'Active';
                    }
                    else if(statusCode == 1){
                        result.status = 'Expired';
                    }
                    else if(statusCode == 2){
                        result.status = 'Claimed';
                    }
                    else if(statusCode == 3){
                        result.status = 'Claimable';
                    }
                }
                callback(error != undefined ? JSON.stringify(error.message) : error, result);
            });
    }
        
}