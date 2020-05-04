module.exports = class Oracles {

    constructor(numOfOracles, flightSuretyApp, web3){
        this.numOfOracles = numOfOracles;
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
            const indicesBuffer = await this.contract.getMyIndexes({from: address});
            const indices = indicesBuffer.map(item =>{return item.toNumber();});
            console.log(
                {   
                    index: i,
                    address: address,
                    indices:indices,
                    isAlwaysLate: isAlwaysLate,
                }
            )
            this.oracles.push({
                address: address,
                indices:indices,
                isAlwaysLate: isAlwaysLate,
            });
        }
    }

    async getFlightStatus(index){

        let statusReturned = [];

        this.oracles.forEach((oracle) => {

            let statusCode;
            let matchingIndex;

            oracle.indices.find((element) => {
                matchingIndex = parseInt(index) == element ? true : false;
            });

            if(matchingIndex){

                if(oracle.isAlwaysLate)
                {
                    statusCode = 20;
                }
                else
                {
                    statusCode = (Math.floor(Math.random() *5) + 1) * 10;
                }

                statusReturned.push([statusCode, oracle.address]);
            }
        });
        console.log(`Status code : ${statusReturned}`);
        return statusReturned;
    }
};