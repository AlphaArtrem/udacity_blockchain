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
    uint8 private constant INSURANCE_CREDITED = 2;

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

    modifier requireAirlineOwner(){
        require(airlines[msg.sender].isActive, "Caller is not verified");
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

    modifier requirePassengerForFlightExists(uint _flightId, address _passenger){
        require(passengersByFlight[_flightId][_passenger], "You are not registered for this flight");
        _;
    }

    /********************************************************************************************/
    /*                                           EVENTS                                         */
    /********************************************************************************************/

    event FlightRegistered(address airline, bytes32 flightKey, uint id, string flight);
    event InsuranceCreated(uint id);
    event InsuranceExpired(uint id);
    event AirlineRegistered(address airline, uint airlineID);
    event AirlineActivated(address airline, uint airlineID);

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
    function setOperatingStatus(bool mode) external requireContractOwner
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address _airline) external requireIsOperational requireAirlineOwner
    {
        airlineCount = airlineCount.add(1);
        airlines[_airline] = Airline({id: airlineCount, isActive: false});

        emit AirlineRegistered(_airline, airlineCount);
    }

    function activateAirline(address _airline) external requireIsOperational requireAirlineOwner requireAirlineExists(_airline){
        airlines[_airline].isActive = true;

        emit AirlineActivated(_airline, airlines[_airline].id);
    }

    function registerFlight(address _airline, string _flight, uint256 _departureTimestamp)
    external requireIsOperational requireAirlineOwner requireActiveAirline(_airline) requireAirlineExists(_airline)
    {
        require(_departureTimestamp > block.timestamp, "Departure Time Can't Be Less Than Current Time");

        bytes32 key = getFlightKey(_airline, _flight, _departureTimestamp);
        flights[key] = Flight({
            flight: _flight,
            statusCode: STATUS_CODE_UNKNOWN,
            updatedTimestamp: block.timestamp,
            departureTimestamp: _departureTimestamp,
            airline : _airline
        });

        flightCount = flightCount.add(1);
        flightIdToKey[flightCount] = key;

        emit FlightRegistered(_airline, key, flightCount, _flight);
    }

    function getFlight(uint _id) external view requireIsOperational requireFlightExists(_id)
    returns (address, string memory, uint256, uint8){
        bytes32 key = flightIdToKey[_id];
        return(flights[key].airline, flights[key].flight, flights[key].departureTimestamp, flights[key].statusCode);
    }

    function getFlightCount() external view requireIsOperational returns(uint){
        return flightCount;
    }

    function addPassengerForFlight(uint _flightId, address _passenger) external
    requireIsOperational requireAirlineOwner requireFlightExists(_flightId)
    {
        passengersByFlight[_flightId][_passenger] = true;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buyInsurance(uint _flightId, uint _amountPaid, address _owner) external
    requireIsOperational requireFlightExists(_flightId) requirePassengerForFlightExists(_flightId, _owner)
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

    function getInsurancesByFlight(uint _flightId) external view
    requireIsOperational requireFlightExists(_flightId) returns(uint[]){
        return insurancesByFlight[_flightId];
    }

    function getInsurancesByPassenger(address _passenger) external view
    requireIsOperational returns(uint[]){
        return insurancesByPassenger[_passenger];
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees() external pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay() external pure
    {
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
    function() external payable
    {
        fund();
    }


}

