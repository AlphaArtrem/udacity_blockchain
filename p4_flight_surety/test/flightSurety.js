
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
      catch(e) {
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
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
        await config.flightSuretyApp.activateAirline(newAirline);
    }
    catch(e) 
    {}

    let result = await config.flightSuretyData.isAirlineActive.call(newAirline, {from: config.flightSuretyApp.address}); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });
 

});
