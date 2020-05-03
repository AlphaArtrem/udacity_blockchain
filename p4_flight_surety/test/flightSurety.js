
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('Setup contract', async () => {
    config = await Test.Config(accounts);
    //config.flightSuretyData.addAuthorisedContract(config.flightSuretyApp.address, {from: config.owner});
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`Contracts has correct initial isOperational() value`, async function () {

    // Get operating status
    let statusData = await config.flightSuretyData.isOperational.call();
    let statusApp = await config.flightSuretyApp.isOperational.call();

    assert.equal(statusData, true, "Incorrect initial operating status value for data contract");
    assert.equal(statusApp, true, "Incorrect initial operating status value for app contract");
  });

  it(`Contracts can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDeniedData = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) 
      {
          accessDeniedData = true;
      }

      let accessDeniedApp = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) 
      {
          accessDeniedApp = true;
      }

      assert.equal(accessDeniedData, true, "Access not restricted to Contract Owner in data contract");
      assert.equal(accessDeniedApp, true, "Access not restricted to Contract Owner in app contract");
  });

  it(`Contracts can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDeniedData = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) 
      {

          accessDeniedData = true;
      }

      let accessDeniedApp = false;
      try 
      {
          await config.flightSuretyApp.setOperatingStatus(false);
      }
      catch(e) 
      {
          accessDeniedApp = true;
      }

      assert.equal(accessDeniedData, false, "Access not restricted to Contract Owner in data contract");
      assert.equal(accessDeniedApp, false, "Access not restricted to Contract Owner in app contract");
      
  });

  it(`Contracts can block access to functions using requireIsOperational when operating status is false`, async function () {

      let revertedData = false;
      try 
      {
          await config.flightSuretyData.setTestingMode();
      }
      catch(e) {
          revertedData = true;
      }

      let revertedApp = false;
      try 
      {
          await config.flightSuretyApp.setTestingMode();
      }
      catch(e) 
      {
          revertedApp = true;
      }


      assert.equal(revertedData, true, "Access not blocked for requireIsOperational in data contract");    
      assert.equal(revertedApp, true, "Access not blocked for requireIsOperational in app contract");        

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);
      await config.flightSuretyApp.setOperatingStatus(true);

  });

  it('App contract can call data contract', async () => {
      
    let flightCount = await config.flightSuretyData.getAirlineCount.call({from: config.flightSuretyApp.address});
    // ASSERT
    assert.equal(flightCount, 1, "Invalid initial airline Count");

  });


  it('Cannot register and activate an Airline if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[1];

    // ACT
    try 
    {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
        await config.flightSuretyApp.activateAirline(newAirline);
    }
    catch(e) 
    {}

    let result = await config.flightSuretyData.isAirlineActive.call(newAirline, {from: config.flightSuretyApp.address}); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('Can register and activate an Airline if it is funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try 
    {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
        await config.flightSuretyApp.activateAirline(newAirline, {from: newAirline, value : web3.utils.toWei("10", "ether")});
    }
    catch(e) 
    {
        console.log(JSON.stringify(e));
    }

    let result = await config.flightSuretyData.isAirlineActive.call(newAirline, {from: config.flightSuretyApp.address}); 

    // ASSERT
    assert.equal(result, true, "Airline should be able to register another airline if it provided sufficient funding");

  });

  it('Can register and but not activate an Airline without voting', async () => {
    
    // Register enough airlines to begin voting phase
    let newAirline;

    for(let i = 3; i < 6; i++){
        newAirline = accounts[i];
        try 
        {
            await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
            await config.flightSuretyApp.activateAirline(newAirline, {from: newAirline, value : web3.utils.toWei("10", "ether")});
        }
        catch(e) 
        {
            console.log(JSON.stringify(e));
        }
    }

    newAirline = accounts[6];

    // Add new flight for voting
    try {
            await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
            await config.flightSuretyApp.activateAirline(newAirline, {from: newAirline, value : web3.utils.toWei("10", "ether")});
        }
    catch(e) 
        {}

    let added = await config.flightSuretyApp.bufferAirlineExists.call(newAirline); 
    let active = await config.flightSuretyData.isAirlineActive.call(newAirline, {from: config.flightSuretyApp.address}); 

    // ASSERT
    assert.equal(added, true, "Airline should be able to add another airline for voting");
    assert.equal(active, false, "Airline should not be activated without enough votes");
  });

  it('Can register and activate an Airline with voting and paying fees', async () => {
    
    let newAirline = accounts[7];

    // Add new flight for voting
    try {
            await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
        }
    catch(e) 
        {
            console.log(+ JSON.stringify(e));
        }
    
    // Cast votes for new airline 5/2 = 2.5 => 2   
    let voter = accounts[3];
    try 
    {
        await config.flightSuretyApp.voteForAirline(newAirline, {from: voter});
    }
    catch(e) 
    {
        console.log(JSON.stringify(e));
    }

    // Pay registreation fees
    try 
    {
        await config.flightSuretyApp.activateAirline(newAirline, {from: newAirline, value : web3.utils.toWei("10", "ether")});
    }
    catch(e) 
    {
        console.log(JSON.stringify(e))
    }
 
    let active = await config.flightSuretyData.isAirlineActive.call(newAirline, {from: config.flightSuretyApp.address}); 

    // ASSERT
    assert.equal(active, true, "Airline should be activated with enough votes");
  });

  it('Flights cannot be registered for non active airline', async () => {
    
    // ARRANGE
    let airline = accounts[1];

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(airline, "FAB12", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.getFlight.call(1); 
    }
    catch(e)
    {}

    // ASSERT
    assert.equal(result, undefined, "Flights can only be registered for active airlines");

  });

  it('Flights cannot be registered by non airline owner accounts', async () => {
    
    // ARRANGE
    let airline = accounts[0];

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(airline, "FAB12", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: accounts[1]});
    }
    catch(e) 
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.getFlight.call(1); 
    }
    catch(e)
    {}

    // ASSERT
    assert.equal(result, undefined, "Flights can only be registered for airline owners");

  });

  it('Flights can be registered by active airline owner accounts', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB12", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.getFlight.call(1); 
    }
    catch(e)
    {}

    // ASSERT
    assert.equal(result['0'], config.firstAirline , "Active airline owners should be able to register new flights");

  });

  it('Passengers cannot be added by people other than airline owners', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB13", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.addPassengerForFlight(2, accounts[9], {from : accounts[8]}); 
    }
    catch(e)
    {
        result = false;
    }

    // ASSERT
    assert.equal(result, false , "Only airline owners should be able to add passengers");

  });

  it('Passengers cannot be added by airline owners if flight doesn\'t exists', async () => {

    // ACT
    let result;

    try
    {
        result = await config.flightSuretyApp.addPassengerForFlight(3, accounts[9], {from :config.firstAirline}); 
    }
    catch(e)
    {
        result = false;
    }

    // ASSERT
    assert.equal(result, false , "Airline owners should be able to add passengers only when flight exists");

  });

  it('Passengers can be added by airline owners if flight exists', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB13", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    let result = true;

    try
    {
        await config.flightSuretyApp.addPassengerForFlight(3, accounts[9], {from : config.firstAirline}); 
    }
    catch(e)
    {
        result = false;
    }

    // ASSERT
    assert.equal(result, true , "Airline owners should be able to add passengers only for existing flight");

  });

  it('Cannot buy insurance if caller is not a passenger for flight', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB14", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.buyInsurance(4, {from : accounts[9], value : web3.utils.toWei("1", "ether")}); 
    }
    catch(e)
    {
        result = false;
    }



    // ASSERT
    assert.equal(result, false , "Only passengers for existing flights can buy insurance");

  });

  it('Cannot buy insurance if passenger doesn\'t pay', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB15", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    try
    {
        await config.flightSuretyApp.addPassengerForFlight(5, accounts[9], {from : config.firstAirline}); 
    }
    catch(e)
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.buyInsurance(5, {from : accounts[9]}); 
    }
    catch(e)
    {
        result = false;
    }
    // ASSERT
    assert.equal(result, false , "Passengers cannot buy insurance without paying");

  });

  it('Cannot buy insurance if passenger pays more than required', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB16", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    try
    {
        await config.flightSuretyApp.addPassengerForFlight(6, accounts[9], {from : config.firstAirline}); 
    }
    catch(e)
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.buyInsurance(6, {from : accounts[9], value: web3.utils.toWei("1.5", "ether")}); 
    }
    catch(e)
    {
        result = false;
    }
    // ASSERT
    assert.equal(result, false , "Passengers should not be able to buy insurance if they pay extra");

  });

  it('Can buy insurance if passenger is registered for flight and pays', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB17", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    try
    {
        await config.flightSuretyApp.addPassengerForFlight(7, accounts[9], {from : config.firstAirline}); 
    }
    catch(e)
    {}

    let result = true;

    try
    {
        await config.flightSuretyApp.buyInsurance(7, {from : accounts[9], value: web3.utils.toWei("0.5", "ether")}); 
    }
    catch(e)
    {
        result = false;
    }
    // ASSERT
    assert.equal(result, true , "Passengers should be able to buy insurance after paying");

  });

  
  it('Can get insurance by flight', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB18", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    try
    {
        await config.flightSuretyApp.addPassengerForFlight(8, accounts[9], {from : config.firstAirline}); 
    }
    catch(e)
    {}

    try
    {
        await config.flightSuretyApp.buyInsurance(8, {from : accounts[9], value: web3.utils.toWei("0.5", "ether")}); 
    }
    catch(e)
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.getInsurancesByFlight.call(8, {from : accounts[9]});
    }
    catch(e)
    {
    }
    // ASSERT
    assert.equal(result[0], '2' , "Should be able to get insurance by flight");

  });

  it('Can get insurance by passenger', async () => {

    // ACT
    try 
    {
        await config.flightSuretyApp.registerFlight(config.firstAirline, "FAB19", (Math.ceil(new Date().valueOf()/1000)) + 24*60*60 , {from: config.firstAirline});
    }
    catch(e) 
    {}

    try
    {
        await config.flightSuretyApp.addPassengerForFlight(9, accounts[9], {from : config.firstAirline}); 
    }
    catch(e)
    {}

    try
    {
        await config.flightSuretyApp.buyInsurance(9, {from : accounts[9], value: web3.utils.toWei("0.75", "ether")}); 
    }
    catch(e)
    {}

    let result;

    try
    {
        result = await config.flightSuretyApp.getInsurancesByPassenger.call(accounts[9], {from : accounts[9]});
    }
    catch(e)
    {
    }
    // ASSERT
    assert.equal(result[0], '1' , "Should be able to get insurance by flight");

  });

});
