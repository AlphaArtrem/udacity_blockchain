
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.addAuthorisedContract(config.flightSuretyApp.address, {from: config.ow});
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let statusData = await config.flightSuretyData.isOperational.call();
    let statusApp = await config.flightSuretyApp.isOperational.call();

    assert.equal(statusData, true, "Incorrect initial operating status value for data contract");
    assert.equal(statusApp, true, "Incorrect initial operating status value for app contract");
  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

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

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

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

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);
      await config.flightSuretyApp.setOperatingStatus(false);

      let revertedData = false;
      try 
      {
          await config.flightSuretyData.setTestingMode(true).call();
      }
      catch(e) {
          revertedData = true;
      }

      let revertedApp = false;
      try 
      {
          await config.flightSuretyApp.setTestingMode(true).call();
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

  it('(airline) cannot register and activate an Airline if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
        await config.flightSuretyApp.activateAirline(newAirline);
    }
    catch(e) 
    {
        console.log(JSON.stringify(e));
    }
    let result = await config.flightSuretyData.isAirlineActive.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });
 

});
