const starNotary = artifacts.require("StarNotary");

module.exports = function(deployer) {
  deployer.deploy(starNotary);
};
