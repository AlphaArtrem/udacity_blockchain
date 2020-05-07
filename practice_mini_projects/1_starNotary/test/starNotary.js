// Importing the StartNotary Smart Contract ABI (JSON representation of the Smart Contract)
const starNotary = artifacts.require("StarNotary");

var accounts; // List of development accounts provided by Truffle
var owner; // Global variable use it in the tests cases

// This called the StartNotary Smart contract and initialize it
contract('StarNotary', (accs) => {
    accounts = accs; // Assigning test accounts
    owner = accounts[0]; // Assigning the owner test account
});


it('has correct name', async () => {
    let instance = await starNotary.deployed();
    let starName = await instance.starName.call();
    assert.equal(starName, "Yash's Star");
});

it('can be claimed', async () => {
    let instance = await starNotary.deployed(); 
    await instance.claimStar({from: owner}); 
    let starOwner = await instance.starOwner.call(); 
    assert.equal(starOwner, owner);
});


it('can change owners', async () => {
    let instance = await starNotary.deployed();
    let secondUser = accounts[1];
    await instance.claimStar({from: owner});
    let starOwner = await instance.starOwner.call();
    assert.equal(starOwner, owner);
    await instance.claimStar({from: secondUser});
    let secondOwner = await instance.starOwner.call();
    assert.equal(secondOwner, secondUser);
 });

 it('can change names', async () => {
    let instance = await starNotary.deployed();
    await instance.changeName('New Star');
    let starName = await instance.starName.call();
    assert.equal(starName, 'New Star');
 });
