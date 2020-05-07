pragma solidity >= 0.4.24;

contract StarNotary{
    string public starName;
    address public starOwner;

    event ownerChanged(address, string);
    event nameChanged(string);

    constructor() public{
        starName = "Yash's Star";
    }

    function claimStar() public{
        starOwner = msg.sender;
        emit ownerChanged(starOwner, starName);
    }

    function changeName(string memory newName) public{
        starName = newName;
        emit nameChanged(starName);
    }
}