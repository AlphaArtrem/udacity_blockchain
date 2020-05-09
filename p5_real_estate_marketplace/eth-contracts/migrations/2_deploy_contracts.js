// migrating the appropriate contracts
var Verifier = artifacts.require("Verifier");
var SolnVerifier = artifacts.require("SolnVerifier");
var AlphaPropertyToken = artifacts.require('AlphaPropertyToken');

module.exports = async function(deployer) {
  await deployer.deploy(AlphaPropertyToken);
  await AlphaPropertyToken.deployed();
  await deployer.deploy(Verifier);
  const verifier = await Verifier.deployed();
  await deployer.deploy(SolnVerifier, verifier.address);
  await SolnVerifier.deployed();
};
