// Test if a new solution can be added for contract - SolnVerifier
// Test if an ERC721 token can be minted for contract - SolnVerifier

var SolnVerifier = artifacts.require('SolnVerifier');
var Verifier = artifacts.require('Verifier');
const zokratesProof = require("../../zokrates/code/square/proof.json");

contract("Test SolnVerifier", accounts => {
    const account_one = accounts[0];
    const account_two = accounts[1];

    beforeEach(async() => {
        this.contractVerifier = await Verifier.new({from: account_one});
        this.contractSolnVerifier = await SolnVerifier.new(this.contractVerifier.address, {from: account_one});
    });

    it("New solution can be added for contract", async() => {
        
        let result = true;
        
        try
        {
            await this.contractSolnVerifier.addSolution(...Object.values(zokratesProof.proof), zokratesProof.inputs, account_two, 1, { from: account_two });
        }
        catch(e)
        {
            result = false;
        }
            assert.equal(result, true, "New solution should have been added");
    });

    it("ERC721 token can be minted for contract", async() => {
        let result = true;

        try
        {
            await this.contractSolnVerifier.addSolution(...Object.values(zokratesProof.proof), zokratesProof.inputs, account_two, 1, { from: account_two });
            await this.contractSolnVerifier.mint(account_two, 1, { from: account_one });
        }
        catch(e)
        {
            result = false;
        }
            assert.equal(result, true, "Token should have been minted");
    });
});
