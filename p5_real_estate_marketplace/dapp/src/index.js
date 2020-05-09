import Web3 from "web3";
import solnVerifier from "../../eth-contracts/build/contracts/SolnVerifier.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = solnVerifier.networks[networkId];
      this.meta = new web3.eth.Contract(
        solnVerifier.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      App.setStatus("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  readFile: function (file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8")
      reader.onload = (evt) => {
        resolve(evt.target.result);
      };
    })
  },

  addSolution: async function() {
    const { addSolution } = this.meta.methods;
    const solutionFile = document.getElementById("solutionFile").files;
    const tokenId = document.getElementById("solutionTokenID").value;
    var proof;
    try{
      proof = await App.readFile(solutionFile[0]);
      proof = JSON.parse(proof);;
    }
    catch(e){
      App.setStatus("Couldn't read file");
    }
    await addSolution(...Object.values(proof.proof), proof.inputs, this.account, tokenId).send({from: this.account}, (error, result) => {
      if(error){
        App.setStatus(error.message);
      }
      else{
        App.setStatus("New solution submitted. <br> Tx ID : " + result);
      }
    });
  },

  mintToken: async function (){
    const { mint } = this.meta.methods;
    const tokenId = document.getElementById("mintTokenID").value;
    await mint(this.account, tokenId).send({from: this.account}, (error, result) => {
      if(error){
        App.setStatus(error.message);
      }
      else{
        App.setStatus("New Token Minted. <br> Tx ID : " + result);
      }
    })
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});