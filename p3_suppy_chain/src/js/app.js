App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",

    init: async function () {
        App.readForm();
        /// Setup access to blockchain
        return await App.initWeb3();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(
            App.sku,
            App.upc,
            App.ownerID, 
            App.originFarmerID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.productNotes, 
            App.productPrice, 
            App.distributorID, 
            App.retailerID, 
            App.consumerID
        );
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        App.getMetaskAccountID();

        return App.initSupplyChain();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initSupplyChain: function () {
        /// Source the truffle compiled smart contracts
        var jsonSupplyChain='../../build/contracts/SupplyChain.json';
        
        /// JSONfy the smart contracts
        $.getJSON(jsonSupplyChain, function(data) {
            console.log('data',data);
            var SupplyChainArtifact = data;
            App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
            App.contracts.SupplyChain.setProvider(App.web3Provider);

        });

        return App.bindEvents();
    },

    addProductForm: function(){
        document.getElementById('role-action-add').style.display = 'block';
        document.getElementById('role-action-sell').style.display = 'none';
        document.getElementById('role-action-farmer').style.display = 'none';
        App.getMetaskAccountID()
        document.getElementById('originFarmerID').value = App.metamaskAccountID;
    },

    sellProductForm: function(){
        document.getElementById('role-action-add').style.display = 'none';
        document.getElementById('role-action-sell').style.display = 'block';
        document.getElementById('role-action-farmer').style.display = 'none';
    },

    modifyProductForm: function(){
        document.getElementById('role-action-add').style.display = 'none';
        document.getElementById('role-action-sell').style.display = 'none';
        document.getElementById('role-action-farmer').style.display = 'block';
    },


    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            }
    },

    addItemHistory: function(tx) {
        App.contracts.SupplyChain.deployed().then(function (instance){
            console.log("TO BE ADDED" + tx + App.upc);
            return instance.addItemHistory(App.upc, tx);
        }).then(function(result) {
            $("#status-2").text("Added to history");
            $("#status-sell-2").text("Added to history");
            $("#status-other-2").text("Added to history");
            console.log('addedHistoryItem',result);
        }).catch(function(err) {
            $("#status-2").text("Error : " + JSON.stringify(err.message));
            $("#status-sell-2").text("Error : " + JSON.stringify(err.message));
            $("#status-other-2").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },

    
    getItemHistory: function() {
        const historyOne = ['Harvested', 'Processed', 'Packed', 'Sold'];
        const historyTwo = ['Bought', 'Shipped', 'Recieved', 'Purchased']

        App.upc = $('#upc').val();
        console.log(App.upc);

        App.contracts.SupplyChain.deployed().then(function (instance){
            return instance.getItemHistoryOne.call(App.upc);
        }).then(function(result) {
            console.log('addedHistoryItem',result);
            document.getElementById('history').style.display = 'table';
            document.getElementById("history-logs").innerHTML = ' ';
            for(var i = 0 ; i < result.length; i++){
                if(result[i].length > 0){
                    $("#history-logs").append('<tr>' + "<th scope='row'>" + (i + 1) + '</th>' +'<td>' + historyOne[i] + '</td>' + '<td>' + result[i] + '</td>' + '</tr>');
                }
            }
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });

        App.contracts.SupplyChain.deployed().then(function (instance){
            return instance.getItemHistoryTwo.call(App.upc);
        }).then(function(result) {
            console.log('addedHistoryItem',result);
            for(var i = 0 ; i < result.length; i++){
                if(result[i].length > 0){
                    $("#history-logs").append('<tr>' + "<th scope='row'>" + (i + 5) + '</th>' +'<td>' + historyTwo[i] + '</td>' + '<td>' + result[i] + '</td>' + '</tr>');
                }
            }
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },

   
    searchResult: function(){
        const searchOne = ['SKU', 'UPC', 'Owner ID', 'Origin Farmer ID', 'Origin Farmer Name', 'Origin Farm Info', 'Origin Farm Latitude', 'Origin Farm Longitude']
        const searchTwo = ['Product ID', 'Prodcut Notes', 'Porduct Price', 'Item State', 'Distributor ID', 'Retailer ID', 'Consumer ID'];

        if(window.location.href == window.location.origin + "/src/html/farmers.html"){
            
            document.getElementById('role-action-add').style.display = 'none';
            document.getElementById('role-action-sell').style.display = 'none';
            document.getElementById('role-action-farmer').style.display = 'none';
            
        }

        App.contracts.SupplyChain.deployed().then(function (instance){
            return  instance.fetchItemBufferOne.call(App.upc);
        }).then(function(result) {
            console.log('searchResult',result);
            document.getElementById('search').style.display = 'table';
            for(var i = 0 ; i < result.length; i++){
                if(i < 2){
                    $("#search-logs").append('<tr>' + "<th scope='row'>" + (i + 1) + '</th>' +'<td>' + searchOne[i] + '</td>' + '<td>' + result[i]['c'] + '</td>' + '</tr>'); 
                }
                else if(result[i].length > 0){
                    $("#search-logs").append('<tr>' + "<th scope='row'>" + (i + 1) + '</th>' +'<td>' + searchOne[i] + '</td>' + '<td>' + result[i] + '</td>' + '</tr>');
                }
            }
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);   
        });

        App.contracts.SupplyChain.deployed().then(function (instance){
            return  instance.fetchItemBufferTwo.call(App.upc);
        }).then(function(result) {
            console.log('searchResult',result);
            document.getElementById('search').style.display = 'table';
            for(var i = 2 ; i < result.length; i++){
                if(i == 2 || i == 4 || i == 5){
                    $("#search-logs").append('<tr>' + "<th scope='row'>" + (i + 6) + '</th>' +'<td>' + searchTwo[i - 2] + '</td>' + '<td>' + result[i]['c'] + '</td>' + '</tr>'); 
                }
                else if(result[i].length > 0){
                    $("#search-logs").append('<tr>' + "<th scope='row'>" + (i + 6) + '</th>' +'<td>' + searchTwo[i - 2] + '</td>' + '<td>' + result[i] + '</td>' + '</tr>');
                }
            }
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);   
        });
    },


    search: function(){
        App.upc = $('#search').val();

        document.getElementById('body').innerHTML = '<div class="card col" style="width: 18rem;"> <div class="card-body"> <div class="card text-center"> <div class="card-header"> <h1>Search Result</h1> </div> <div class="card-body"> <br> <table id="search" class="table" style="display: table;"> <thead class="thead-dark"> <tr> <th scope="col">#</th> <th scope="col">Transaction Type</th> <th scope="col">Transaction ID</th> </tr> </thead> <tbody id="search-logs"> </tbody> </table> </div> <div class="card-footer text-muted"> <span id="status"></span> <br> <span id="status-2"></span> </div> </div> </div> </div> </div>';
        App.searchResult();
    },
    home: function(){
        window.location.href = window.location.origin + "/index.html";
    },
    farmers: function(){
        window.location.href = window.location.origin + "/src/html/farmers.html";
    },
    retailers: function(){
        window.location.href = window.location.origin + "/src/html/retailers.html";
    },
    history: function(){
        window.location.href = window.location.origin + "/src/html/history.html";
    },
    distributors: function(){
        window.location.href = window.location.origin + "/src/html/distributors.html";
    },
    consumers: function(){
        window.location.href = window.location.origin + "/src/html/consumers.html";
    },

    harvestItem: function(event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.readForm();
        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.harvestItem(
                App.upc, 
                App.metamaskAccountID, 
                App.originFarmName, 
                App.originFarmInformation, 
                App.originFarmLatitude, 
                App.originFarmLongitude, 
                App.productNotes
            );
        }).then(function(result) {
            const tx = JSON.stringify(result['tx']).toString();
            $("#status").text("Tx ID : " + tx);
            App.addItemHistory(tx);
            console.log('harvestItem',result);
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },

    processItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc-other').val();
        console.log('upc',App.upc, App.metamaskAccountID);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.processItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            const tx = JSON.stringify(result['tx']).toString();
            $("#status-other").text("Tx ID : " + tx);
            App.addItemHistory(tx);
            console.log('processItem',result);
        }).catch(function(err) {
            $("#status-other").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },
    
    packItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc-other').val();
        console.log('upc',App.upc, App.metamaskAccountID);

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.packItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            const tx = JSON.stringify(result['tx']).toString();
            $("#status-other").text("Tx ID : " + tx);
            App.addItemHistory(tx);
            console.log('packItem',result);
        }).catch(function(err) {
            $("#status-other").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },

    sellItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc-sell').val();
        App.productPrice = $('#productPrice-sell').val();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            const productPrice = web3.toWei(1, "ether");
            console.log('productPrice',productPrice);
            return instance.sellItem(App.upc, App.productPrice, {from: App.metamaskAccountID});
        }).then(function(result) {
            const tx = JSON.stringify(result['tx']).toString();
            $("#status-sell").text("Tx ID : " + tx);
            App.addItemHistory(tx);
            console.log('sellItem',result);
        }).catch(function(err) {
            $("#status-sell").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },

    buyItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();
        
        App.contracts.SupplyChain.deployed().then(function(instance) {
            const walletValue = web3.toWei(3, "ether");
            return instance.buyItem(App.upc, {from: App.metamaskAccountID, value: walletValue});
        }).then(function(result) {
            const tx = JSON.stringify(result['tx']).toString();
            $("#status").text("Tx ID : " + tx);
            App.addItemHistory(tx);
            console.log('buyItem',result);
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },

    shipItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.shipItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            const tx = JSON.stringify(result['tx']).toString();
            $("#status").text("Tx ID : " + tx);
            App.addItemHistory(tx);
            console.log('shipItem',result);
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },

    receiveItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.receiveItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            const tx = JSON.stringify(result['tx']).toString();
            $("#status").text("Tx ID : " + tx);
            App.addItemHistory(tx);
            console.log('receiveItem',result);
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },

    purchaseItem: function (event) {
        event.preventDefault();
        var processId = parseInt($(event.target).data('id'));
        App.upc = $('#upc').val();

        App.contracts.SupplyChain.deployed().then(function(instance) {
            return instance.purchaseItem(App.upc, {from: App.metamaskAccountID});
        }).then(function(result) {
            const tx = JSON.stringify(result['tx']).toString();
            $("#status").text("Tx ID : " + tx);
            App.addItemHistory(tx);
            console.log('purchaseItem',result);
        }).catch(function(err) {
            $("#status").text("Error : " + JSON.stringify(err.message));
            console.log(err.message);
        });
    },
};

$(function () {
    $(window).on('load', function () {
        App.init();
    });
});
