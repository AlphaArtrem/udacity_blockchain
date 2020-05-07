// migrating the appropriate contracts
var SquareVerifier = artifacts.require("Verifier.sol");
//var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");
var AlphaPropertToken = artifacts.require('AlphaPropertyToken');

module.exports = function(deployer) {
  deployer.deploy(SquareVerifier);
  //deployer.deploy(SolnSquareVerifier);
  deployer.deploy(AlphaPropertToken);
};
