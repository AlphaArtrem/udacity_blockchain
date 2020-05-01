pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
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

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational;                                           // Blocks all state changes throughout the contract if false
    uint private airlineCount;
    uint private flightCount;
    uint private insuranceCount;

    struct Airline{
        uint id;
        bool isActive;
    }

    struct Flight {
        uint id;
        string flight;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
        uint256 departureTimestamp;
    }

    struct Insurance {
        uint id;
        uint flightId;
        uint8 statusCode;
        uint amountPaid;
        address owner;
    }

    mapping(address => Airline) private airlines;
    mapping(bytes32 => Flight) private flights;
    mapping(uint => Insurance) private insurances;
    mapping(uint => bytes32) private flightIdToKey;
    mapping(address => uint[]) private insurancesByPassenger;
    mapping(uint => uint[]) private insurancesByFlight;
    mapping(uint => mapping(address => bool)) private passengersByFlight;
    mapping(address => bool) private authorisedContracts;


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public payable
    {
        operational = true;
        airlineCount = 0;
        flightCount = 0;
        insuranceCount = 0;
        contractOwner = msg.sender;
        airlineCount = airlineCount.add(1);
        airlines[contractOwner] = Airline({id: airlineCount, isActive : true});
        address(this).transfer(msg.value);
    }

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

    modifier requireAuthorisedContract(){
        require(authorisedContracts[msg.sender] == true, "Contract is not authorised");
        _;
    }

    modifier requireAirlineOwner(address _caller){
        require(airlines[_caller].isActive, "Caller is not verified");
        _;
    }

    modifier requireActiveAirline(address _airline){
        require(airlines[_airline].isActive, "Airline is not active");
        _;
    }

    modifier requireAirlineExists(address _airline){
        require(airlines[_airline].id > 0, "Airline is not registered");
        _;
    }

    modifier requireFlightExists(uint _id){
        bytes32 key = flightIdToKey[_id];
        require(key != "", "Flight is not registered");
        _;
    }

    modifier requireFlightKeyExists(bytes32 _key){
        require(flights[_key].id > 0, "Flight is not registered");
        _;
    }


    modifier requirePassengerForFlightExists(uint _flightId, address _passenger){
        require(passengersByFlight[_flightId][_passenger], "You are not registered for this flight");
        _;
    }

    modifier requireInsuranceOwner(uint _insuranceId, address _caller){
        require(insurances[_insuranceId].owner == _caller, "You cannot claim this insurance");
        _;
    }

    modifier requireInsuranceExists(uint _insuranceId){
        require(insurances[_insuranceId].id > 0, "You cannot claim this insurance");
        _;
    }

    modifier requireInsuranceClaimable(uint _insuranceId){
        require(insurances[_insuranceId].statusCode == INSURANCE_CLAIMABLE, "Insurnce can't be claimed");
        _;
    }

    /********************************************************************************************/
    /*                                           EVENTS                                         */
    /********************************************************************************************/

    event FlightRegistered(address airline, bytes32 flightKey, uint id, string flight);
    event FlightStatusChanged(uint id, uint8 statusCode);
    event InsuranceCreated(uint id);
    event InsuranceExpired(uint id);
    event InsuranceClaimed(uint id);
    event AirlineRegistered(address airline, uint airlineID);
    event AirlineActivated(address airline, uint airlineID);
    event AuthorisedContractAdded(address _contract);

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational() public view returns(bool)
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode) public requireContractOwner
    {
        operational = mode;
    }

    function addAuthorisedContract(address _contract) public requireContractOwner
    {
        authorisedContracts[_contract] = true;

        emit AuthorisedContractAdded(_contract);
    }

    function setTestingMode(bool mode) public requireIsOperational
    returns (bool)
    {
        return true;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address _airline, address _caller) public
    requireAuthorisedContract requireIsOperational requireAirlineOwner(_caller)
    {
        airlines[_airline] = Airline({id: airlineCount, isActive: false});
        airlineCount = airlineCount.add(1);

        emit AirlineRegistered(_airline, airlineCount);
    }

    function activateAirline(address _airline, address _caller) public
    requireAuthorisedContract requireIsOperational requireAirlineOwner(_caller) requireAirlineExists(_airline)
    {
        airlines[_airline].isActive = true;

        emit AirlineActivated(_airline, airlines[_airline].id);
    }

    function getAirlineCount() public view
    requireAuthorisedContract requireIsOperational returns(uint)
    {
        return airlineCount;
    }

    function isAirlineOwner(address _caller) public view
    requireAuthorisedContract requireIsOperational requireAirlineOwner(_caller)
    returns (bool)
    {
        return true;
    }

    function isAirlineRegistered(address _airline) public view
    requireAuthorisedContract requireIsOperational requireAirlineExists(_airline)
    returns(bool)
    {
        return true;
    }

    function isAirlineActive(address _airline) public view
    requireAuthorisedContract requireIsOperational requireActiveAirline(_airline)
    returns (bool)
    {
        return true;
    }

    function registerFlight(address _airline, string _flight, uint256 _departureTimestamp, address _caller) public
    requireAuthorisedContract requireIsOperational requireAirlineOwner(_caller) requireActiveAirline(_airline) requireAirlineExists(_airline)
    {
        require(_departureTimestamp > block.timestamp, "Departure Time Can't Be Less Than Current Time");

        bytes32 key = getFlightKey(_airline, _flight, _departureTimestamp);
        flightCount = flightCount.add(1);

        flights[key] = Flight({
            id: flightCount,
            flight: _flight,
            statusCode: STATUS_CODE_UNKNOWN,
            updatedTimestamp: block.timestamp,
            departureTimestamp: _departureTimestamp,
            airline : _airline
        });

        flightIdToKey[flightCount] = key;

        emit FlightRegistered(_airline, key, flightCount, _flight);
    }

    function getFlight(uint _id) public view
    requireAuthorisedContract requireIsOperational requireFlightExists(_id)
    returns (address, string memory, uint256, uint8)
    {
        bytes32 key = flightIdToKey[_id];
        return(flights[key].airline, flights[key].flight, flights[key].departureTimestamp, flights[key].statusCode);
    }

    function getFlightCount() public view
    requireAuthorisedContract requireIsOperational returns(uint)
    {
        return flightCount;
    }

    function getFlightId(bytes32 _key) public view
    requireAuthorisedContract requireIsOperational requireFlightKeyExists(_key)
    returns (uint)
    {
        return flights[_key].id;
    }

    function setFlightStatus(uint _id, uint8 _statusCode) public
    requireAuthorisedContract requireIsOperational requireFlightExists(_id)
    {
        bytes32 key = flightIdToKey[_id];
        flights[key].statusCode = _statusCode;

        emit FlightStatusChanged(_id, _statusCode);
    }

    function addPassengerForFlight(uint _flightId, address _passenger, address _caller) public
    requireAuthorisedContract requireIsOperational requireAirlineOwner(_caller) requireFlightExists(_flightId)
    {
        passengersByFlight[_flightId][_passenger] = true;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buyInsurance(uint _flightId, uint _amountPaid, address _owner) public
    requireAuthorisedContract requireIsOperational requireFlightExists(_flightId) requirePassengerForFlightExists(_flightId, _owner)
    {
        insuranceCount = insuranceCount.add(1);
        insurances[insuranceCount] = Insurance({
            id: insuranceCount,
            flightId: _flightId,
            amountPaid: _amountPaid,
            owner: _owner,
            statusCode: INSURANCE_ACTIVE
        });

        insurancesByPassenger[_owner].push(insuranceCount);
        insurancesByFlight[_flightId].push(insuranceCount);

        emit InsuranceCreated(insuranceCount);
    }

    function getInsurancesByFlight(uint _flightId) public view
    requireAuthorisedContract requireIsOperational requireFlightExists(_flightId) returns(uint[])
    {
        return insurancesByFlight[_flightId];
    }

    function getInsurancesByPassenger(address _passenger) public view
    requireAuthorisedContract requireIsOperational returns(uint[])
    {
        return insurancesByPassenger[_passenger];
    }

    function getInsuranceById(uint _insuranceId) public view
    requireAuthorisedContract requireIsOperational requireInsuranceExists(_insuranceId)
    returns(uint, uint, uint8, uint, address)
    {
        return(
            insurances[_insuranceId].id,
            insurances[_insuranceId].flightId,
            insurances[_insuranceId].statusCode,
            insurances[_insuranceId].amountPaid,
            insurances[_insuranceId].owner
        );
    }

    function setInsuranceStatusExpired(uint _insuranceId) public
    requireAuthorisedContract requireIsOperational requireInsuranceExists(_insuranceId)
    {
        insurances[_insuranceId].statusCode = INSURANCE_EXPIRED;
        emit InsuranceExpired(_insuranceId);
    }

    function setInsuranceStatusClaimable(uint _insuranceId) public
    requireAuthorisedContract requireIsOperational requireInsuranceExists(_insuranceId)
    {
        insurances[_insuranceId].statusCode = INSURANCE_CLAIMABLE;
        emit InsuranceExpired(_insuranceId);
    }

    function claimInsurance(uint _insuranceId, address _caller) public
    requireAuthorisedContract requireIsOperational requireInsuranceOwner(_insuranceId, _caller)
    requireInsuranceExists(_insuranceId) requireInsuranceClaimable(_insuranceId)
    {
        address owner = insurances[_insuranceId].owner;
        uint amount = insurances[_insuranceId].amountPaid;
        insurances[_insuranceId].statusCode = INSURANCE_CLAIMED;
        owner.transfer(amount);
        emit InsuranceClaimed(_insuranceId);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund() public payable
    {
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() public payable
    {
        fund();
    }


}

