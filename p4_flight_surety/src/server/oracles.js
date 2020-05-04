module.exports = class Oracles {

    constructor(config, flightSuretyApp, web3){
        this.numOfOracles = config.numOfOracles;
        this.statusCodes = config.statusCodes;
        this.lateProbability = 0.7;
        this.contract = flightSuretyApp;
        this.oracles = [];
        this.web3 = web3;
    }

    async init(){
        let accounts = await this.web3.eth.getAccounts();
        const numberOfLateOracles = this.lateProbability * this.numOfOracles;
        for(let i = 0; i < this.numOfOracles; i++){
            let address = accounts[10 + i];
            const isAlwaysLate = i <= numberOfLateOracles ? true : false;

            try
            {
                await this.contract.registerOracle({from: address, value: this.web3.utils.toWei("1", "ether")});
            } 
            catch(e) 
            {
                console.log(`Error :  ${e.message}`);
            }

            let indices = await this.contract.getMyIndexes({from: address}).map(item =>{return item.toNumber();});;

            this.oracles.push({
                address: address,
                indices:indices,
                isAlwaysLate: isAlwaysLate,
            });
        }
    }

    async getFlightStatus(index, airline, flight, timestamp){
        let response = {};

        response.index = index;
        response.airline = airline;
        response.flight = flight;
        response.timestamp = timestamp;

        let statusReturned = [];

        this.oracles.forEach((oracle) => {

            let matchingIndex;

            oracle.indices.find((element) => {
                parseInt(index) == element ? true : false;
            });

            if(matchingIndex){

                if(this.isAlwaysLate)
                {
                    response.statusCode = 20;
                }
                else
                {
                    response.statusCode = (Math.floor(Math.random() *5) + 1) * 10;
                }

                response.address = oracle.address 
                statusReturned.push(response);
            }
        });

        return statusReturned;
    }
};