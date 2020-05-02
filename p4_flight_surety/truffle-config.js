var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
      },
      network_id: '*',
      gas: 9999999
    },
    development_ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      websockets: true,
      from: "0x27942C70AAED404d61698aD33Aaf03C24E42D5f2"
  }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};