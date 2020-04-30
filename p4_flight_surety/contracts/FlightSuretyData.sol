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

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational;                                           // Blocks all state changes throughout the contract if false
    uint private airlineCount;

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

    mapping(address => Airline) private airlines;
    mapping(bytes32 => Flight) private flights;


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public
    {
        operational = true;
        airlineCount = 0;
        contractOwner = msg.sender;
        airlineCount = airlineCount.add(1);
        airlines[contracOwner] = Airline({id: airlineCount, isActive : true});
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

    modifier requireVerifiedCaller(){
        require(airlines[msg.sender].isActive, "Caller is not verified");
    }

    modifier requireActiveAirline(adresss _airline){
        require(airlines[_airline].isActive, "Airline is not active");
    }

    event AirlineRegistered(address airline, uint airlineID);
    event AirlineActivated(address airline, uint airlineID);
    event FlightRegistered(byte32 flightKey, string flight, address airline);

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
    function registerAirline(address _airline) external pure requireIsOperational requireVerifiedCaller
    {
        airlineCount = airlineCount.add(1);
        airlines[airline] = Airline({id: airlineCount, isActive: false});

        emit AirlineRegistered(_airline, airlineCoint);
    }

    function activateAirline(address _airline) external pure requireIsOperational requireVerifiedCaller{
        airlines[_airline].isActive = true;

        emit AirlineActivated(_airline, airlines[_airline].id);
    }

    function registerFlight(address _airline, string memory _flight, uint256 _departureTimestamp)
    external pure requireIsOperational requireVerifiedCaller requireActiveAirline(_airline)
    {
        require(departureTimestamp > block.timestamp, "Departure Time Can't Be Less Than Current Time");

        Flight newFlight = Flight({
            flight: _flight,
            statusCode: STATUS_CODE_UNKNOWN,
            updatedTimestamp: block.timestamp,
            departureTimestamp: _departureTimestamp,
            airline : _airline
        });

        byte32 key = getFlightKey(_airline, _flight, _departureTimestamp);
        flights[key] = newFlight;

        emit FlightRegistered(key, _flight, _airline);
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy() external payable
    {

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

