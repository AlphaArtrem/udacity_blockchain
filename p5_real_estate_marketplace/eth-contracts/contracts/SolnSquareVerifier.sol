pragma solidity >=0.5.0;

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
// TODO define a solutions struct that can hold an index & an address
// TODO define an array of the above struct
// TODO define a mapping to store unique solutions submitted
// TODO Create an event to emit when a solution is added
// TODO Create a function to add the solutions to the array and emit the event
// TODO Create a function to mint new NFT only after the solution has been verified
//  - make sure the solution is unique (has not been used before)
//  - make sure you handle metadata as well as tokenSuplly

import "./ERC721Mintable.sol";
import "./SquareVerifier.sol";

contract SolnSquareVerifier is NipaHutERC721Token {
    SquareVerifier squareVerifier;

    // User-defined structures
    struct Solution {
        uint256 id;
        address owner;
        uint256[2] input;
        bool minted;
    }

    // Variables
    mapping(bytes32 => Solution) solutions;
    mapping(uint256 => bytes32) private submittedSolutions;

    // Modifiers

    modifier requireVerified(){
        require(squareVerifier.verifyTx(a, b, c, input), "Couldn't verify the proof");
        _;
    }

    modifier requireOwner(address from, uint256 id){
        require(from == solutions[submittedSolutions[id]].owner, "wrong token owner address provided")
    }

    //Events
    event SolutionSubmitted(address indexed owner, uint256 indexed id);

    // Functions
    function addSolution (
        uint[2] memory a,
        uint[2][2] memory b,
        int[2] memory c,
        uint[2] memory input,
        address account,
        uint256 id
    ) public
    {
        bytes32 key = getKey(a, b, c, input);

        require(solutions[key].id != 0, "Solution already used");

        submittedSolutions[id] = key;
        solutions[key].id = id;
        solutions[key].input = input;
        solutions[key].owner = account;

        emit SolutionSubmitted(account, id);
    }

    function getKey(
        uint[2] memory a,
        uint[2][2] memory b,
        int[2] memory c,
        uint[2] memory input
    ) internal returns(bytes32)
    {
        return keccak256(abi.encodePacked(a, b, c, input));
    }


    function mint(address to, uint256 id) public returns(bool)
    public return(bool)
    {

    require(submittedSolutions[id] != bytes32(0), "Token Soluton Doesn't Exist");
    require(solutions[submittedSolutions[id]].minted == false, "Token With This ID Has Already Been Minted");
    address owner = solutions[submittedSolutions[id]].owner;
    solutions[submittedSolutions[id]].minted = true;
    bool result  = super.mint(to, id);
    return result;
  }
}


























