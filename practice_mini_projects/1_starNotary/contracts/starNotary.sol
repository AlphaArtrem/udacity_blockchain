pragma solidity >= 0.4.24;

contract StarNotary{
    // Public variables
    string public starName;
    address public starOwner;

    // Event to emit when owner is changed
    event ownerChanged(address, string);

    constructor() public{
        starName = "Yash's Star";
    }

    function claimStar() public{
        starOwner = msg.sender;
        emit ownerChanged(starOwner, starName);
    }
}