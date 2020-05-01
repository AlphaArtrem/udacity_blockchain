pragma solidity >=0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
    uint8 private constant INSURANCE_ACTIVE = 0;
    uint8 private constant INSURANCE_EXPIRED = 1;
    uint8 private constant INSURANCE_CLAIMED = 2;
    uint8 private constant INSURANCE_CLAIMABLE = 3;


    address private contractOwner;          // Account used to deploy contract
    bool private operational;
    uint private airlineCount;

    FlightSuretyData dataContract;

    mapping(address => address[]) bufferAirlineVoters;

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
         // Modify to call data contract's status
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAirlineOwner()
    {
        require(dataContract.isAirlineOwner(msg.sender) == true, "You can't create or vote for airlines");
        _;
    }

    modifier requireUnregisteredAirline(address _airline){
        require(dataContract.isAirlineRegistered(_airline) != true, "Airline is already registered");
        _;
    }

    modifier requirePaidEnough(uint _amount){
        require(msg.value >= _amount, "Insufficient ether paid");
        _;
    }

    modifier requireChange(uint _amount){
        _;
        uint change = msg.value.sub(_amount);
        msg.sender.transfer(change);
    }

    modifier requireregisteredAirline(address _airline){
        require(dataContract.isAirlineRegistered(_airline) == true, "Airline is not registered");
        _;
    }

    modifier requireActiveAirline(address _airline){
        require(dataContract.isAirlineActive(_airline) == true, "Airline is not active");
        _;
    }

    /********************************************************************************************/
    /*                                           EVENTS                                         */
    /********************************************************************************************/

    event AirlineRegistered(address airline, string message);
    event AirlineActive(address airline, string message);
    event FlightRegistered(address airline, string flight);
    event FlightStatusChanged(uint id, uint8 statusCode);

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor(address dataContractAddress) public
    {
        operational = true;
        contractOwner = msg.sender;
        dataContract = FlightSuretyData(dataContractAddress);
        airlineCount = dataContract.getAirlineCount();
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public view returns(bool)
    {
        return operational;  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/


   /**
    * @dev Add an airline to the registration queue
    *
    */
    function registerAirline(address _airline) public
    requireIsOperational requireAirlineOwner requireUnregisteredAirline(_airline)
    {
       if(airlineCount < 5){
           dataContract.registerAirline(_airline, msg.sender);
           airlineCount = dataContract.getAirlineCount();

           emit AirlineRegistered(_airline, "Pay 10 ether to activate airline");
       }
       else{
           bufferAirlineVoters[_airline].push(msg.sender);
           airlineCount = dataContract.getAirlineCount();

           emit AirlineRegistered(_airline, "You need to get 50% votes to activate registraion and pay fees");
       }
    }

    function voteForAirline(address _airline) public
    requireIsOperational requireAirlineOwner requireUnregisteredAirline(_airline)
    {
        airlineCount = dataContract.getAirlineCount();
        bufferAirlineVoters[_airline].push(msg.sender);

        if(bufferAirlineVoters[_airline].length >= (airlineCount / 2)){
            dataContract.registerAirline(_airline, msg.sender);
            airlineCount = dataContract.getAirlineCount();

            emit AirlineRegistered(_airline, "Pay 10 ether to activate airline");
        }
        else{
            emit AirlineRegistered(_airline, "You need to get more votes to activate registraion and pay fees");
        }

    }

    function activateAirline(address _airline) public
    requireIsOperational requireregisteredAirline(_airline) requirePaidEnough(10 ether) requireChange(10 ether)
    {
        dataContract.activateAirline(_airline, msg.sender);

        emit AirlineActive(_airline, "Airline Activated");
    }


   /**
    * @dev Register a future flight for insuring.
    *
    */
    function registerFlight(address _airline, string _flight, uint256 _departureTimestamp) public
    requireIsOperational requireAirlineOwner requireActiveAirline(_airline)
    {
        dataContract.registerFlight(_airline, _flight, _departureTimestamp, msg.sender);
        emit FlightRegistered(_airline, _flight);
    }

    function getFlight(uint _id) public view
    requireIsOperational
    returns (address, string memory, uint256, uint8)
    {
        return dataContract.getFlight(_id);
    }

    // Passengers

    function addPassengerForFlight(uint _flightId, address _passenger) public
    requireIsOperational requireAirlineOwner
    {
        dataContract.addPassengerForFlight(_flightId, _passenger, msg.sender);
    }

    // Insurance

    function buyInsurance(uint _flightId, uint _amountPaid) public
    requireIsOperational
    {
        dataContract.buyInsurance(_flightId, _amountPaid, msg.sender);
    }

    function getInsurancesByFlight(uint _flightId) public view
    requireIsOperational returns(uint[])
    {
        return dataContract.getInsurancesByFlight(_flightId);
    }

    function getInsurancesByPassenger(address _passenger) public view
    requireIsOperational returns(uint[])
    {
        return dataContract.getInsurancesByPassenger(_passenger);
    }

    function getInsuranceById(uint _insuranceId) public view
    requireIsOperational
    returns(uint, uint, uint8, uint, address)
    {
        return dataContract.getInsuranceById(_insuranceId);
    }

    function claimInsurance(uint _insuranceId) public
    requireIsOperational
    {
        dataContract.claimInsurance(_insuranceId, msg.sender);
    }


   /**
    * @dev Called after oracle has updated flight status
    *
    */
    function processFlightStatus(address airline, string memory flight, uint256 timestamp, uint8 statusCode) public
    {
        bytes32 key = keccak256(abi.encodePacked(airline, flight, timestamp));
        uint id = dataContract.getFlightId(key);

        uint[] memory insurancesIds;

        dataContract.setFlightStatus(id, statusCode);
        uint i = 0;

        if(statusCode == STATUS_CODE_LATE_AIRLINE && block.timestamp >= timestamp){
            insurancesIds = dataContract.getInsurancesByFlight(id);

            for(i = 0; i < insurancesIds.length; i++){
                dataContract.setInsuranceStatusClaimable(insurancesIds[i]);
            }
        }
        else if(statusCode == STATUS_CODE_ON_TIME && block.timestamp >= timestamp){
            insurancesIds = dataContract.getInsurancesByFlight(id);

            for(i = 0; i < insurancesIds.length; i++){
                dataContract.setInsuranceStatusExpired(insurancesIds[i]);
            }
        }

        emit FlightStatusChanged(id, statusCode);
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(address airline, string flight, uint256 timestamp) external
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({requester: msg.sender, isOpen: true});

        emit OracleRequest(index, airline, flight, timestamp);
    }


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle() external payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({isRegistered: true, indexes: indexes});
    }

    function getMyIndexes() external view returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(uint8 index, address airline, string flight, uint256 timestamp, uint8 statusCode) external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index),
         "Index does not match oracle request");


        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }


    function getFlightKey(address airline, string flight, uint256 timestamp)
    public pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address account) public returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address account) public returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion

}

contract FlightSuretyData{

    function registerAirline(address _airline, address _caller) public;
    function activateAirline(address _airline, address _caller) public;
    function getAirlineCount() public view returns(uint);
    function isAirlineOwner(address _caller) public view returns (bool);
    function isAirlineRegistered(address _airline) public view returns(bool);
    function isAirlineActive(address _airline) public view returns (bool);
    function registerFlight(address _airline, string _flight, uint256 _departureTimestamp, address _caller) public;
    function getFlight(uint _id) public view returns (address, string memory, uint256, uint8);
    function getFlightCount() public view returns(uint);
    function getFlightId(bytes32 _key) public view returns (uint);
    function setFlightStatus(uint _id, uint8 _statusCode) public;
    function addPassengerForFlight(uint _flightId, address _passenger, address _caller) public;
    function buyInsurance(uint _flightId, uint _amountPaid, address _owner) public;
    function getInsurancesByFlight(uint _flightId) public view returns(uint[]);
    function getInsurancesByPassenger(address _passenger) public view returns(uint[]);
    function getInsuranceById(uint _insuranceId) public view returns(uint, uint, uint8, uint, address);
    function setInsuranceStatusExpired(uint _insuranceId) public;
    function setInsuranceStatusClaimable(uint _insuranceId) public;
    function claimInsurance(uint _insuranceId, address _caller) public;
}
