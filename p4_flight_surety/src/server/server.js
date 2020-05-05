const fs = require("fs");
const Web3 = require("web3");
const Oracles = require("./oracles");
const TruffleContract = require("truffle-contract");
const express = require("express");

let FlightSuretyApp = JSON.parse(fs.readFileSync('../../build/contracts/FlightSuretyApp.json'));
let Config = JSON.parse(fs.readFileSync("./config.json"));
let config = Config['localhost'];
let web3Provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'));
let flightSuretyApp = TruffleContract(FlightSuretyApp);
flightSuretyApp.setProvider(web3Provider);


(async ()=>{

    let contract, oracles;
    try 
    {
        contract = await flightSuretyApp.at(config.appAddress);
        oracles = new Oracles(20, contract, new Web3(web3Provider));
        await oracles.init();
    } 
    catch(e)
    {
        console.log(e);
    }

    contract.OracleRequest().on("data", async event => {

            let flightStatuses;
            try 
            {
                flightStatuses = await oracles.getFlightStatus(event.returnValues.index);
            } 
            catch(e)
            {
                console.log('Error getStatus : ' + e);
                return;
            }

            console.log(flightStatuses);
            flightStatuses.forEach(async (arr) => {
                try 
                {
                    await contract.submitOracleResponse(
                        event.returnValues.index,
                        event.returnValues.airline,
                        event.returnValues.flight,
                        event.returnValues.timestamp,
                        arr[0],
                        {from: arr[1],  gas: 999999999});
                }
                catch(e)
                {
                    console.log(e);
                }

            });
        }).on("error", err => {
            console.log(err);
        });
})();



