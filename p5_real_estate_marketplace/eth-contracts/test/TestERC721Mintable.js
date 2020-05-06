var AlphaPropertToken = artifacts.require('AlphaPropertyToken');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await AlphaPropertToken.new({from: account_one});

            // TODO: mint multiple tokens

            for(let i = 0 ; i < 20; i++){
                if(i < 10){
                    await this.contract.mint(account_one, (i + 1), {from : account_one});
                }
                else{
                    await this.contract.mint(account_two, (i + 1), {from : account_one});
                }
            }
        })

        it('should return total supply', async function () { 
            assert.equal(await this.contract.totalSupply.call(), 20);
        })

        it('should get token balance', async function () { 
            assert.equal(await this.contract.balanceOf(account_one), 10);
            assert.equal(await this.contract.balanceOf(account_two), 10);
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
            assert.equal(await this.contract.tokenURI(1), "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1");
        })

        it('should transfer token from one owner to another', async function () { 
            await this.contract.transferFrom(account_two, account_one, 11, {from: account_two});
            assert.equal(await this.contract.ownerOf(11), account_one);
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await AlphaPropertToken.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () { 
            let result = true;
            try{
                await this.contract.mint(account2, 1, {from: account_two});
            } 
            catch(e){
                result = false;
            }

            assert.equal(result, false);
        })

        it('should return contract owner', async function () { 
            assert.equal(await this.contract.getOwner(), account_one);
        })

    });
})