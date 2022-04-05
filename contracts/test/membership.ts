import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import Safe from '@gnosis.pm/safe-core-sdk';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, constants } from 'ethers';

const { AbiCoder } = ethers.utils;
const { AddressZero } = constants;

const abiCoder = new AbiCoder();

describe('Membership', function () {
  describe('Disabled methods', () => {
    let membership: Contract;

    beforeEach(async function () {
      const [signer, recipient] = await ethers.getSigners();

      const SINGLETON_SOURCE = `
        contract Test {
            address _singleton;
            address public creator;
            bool public isInitialized;
            constructor() payable {
                creator = msg.sender;
            }
            function init() public {
                require(!isInitialized, "Is initialized");
                creator = msg.sender;
                isInitialized = true;
            }

            function masterCopy() public pure returns (address) {
                return address(0);
            }

            function forward(address to, bytes memory data) public returns (bytes memory result) {
                (,result) = to.call(data);
            }
        }`;

      const ethAdapter = new EthersAdapter({
        ethers,
        signer,
      });

      const GnosisProxy = await ethers.getContractFactory('GnosisSafeProxy');
      const proxy = await GnosisProxy.deploy(AddressZero);

      await proxy.deployed();

      const SAFE_ADDRESS = AddressZero;

      const safeSdk: Safe = await Safe.create({
        ethAdapter,
        safeAddress: SAFE_ADDRESS,
      });

      this.recipient = recipient;

      const Membership = await ethers.getContractFactory('Membership', signer);

      membership = await Membership.deploy(safeSdk.getAddress());

      await membership.deployed();
    });

    describe('#approved', () => {
      it('should be disabled', async function () {
        await expect(membership.approve(membership.address, 1)).reverted;
      });
    });

    describe('#transferFrom', () => {
      it('should be disabled', async function () {
        await expect(
          membership.transferFrom(membership.address, membership.address, 1)
        ).reverted;
      });
    });

    describe('#mint', () => {
      it('should apply the correct mapping', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        const mintTx = await membership.mint(this.recipient.address, tokenData);

        await mintTx.wait();

        const tokenDataResult = await membership.tokenData(1);

        expect(tokenDataResult).to.be.equal(tokenData);

        const tokenOwnerResult = await membership.tokenOwner(1);

        expect(tokenOwnerResult).to.be.equals(this.recipient.address);
      });
    });

    describe('#update', () => {
      it('should update the following mappings', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        const mintTx = await membership.mint(this.recipient.address, tokenData);

        await mintTx.wait();

        const updatedIpfsHash = 'HASH';

        const updatedTokenData = abiCoder.encode(['string'], [updatedIpfsHash]);

        const updateTokenTx = await membership.updateToken(1, updatedTokenData);

        await updateTokenTx.wait();

        const tokenOwnerResult = await membership.tokenOwner(1);

        expect(tokenOwnerResult).to.be.equals(this.recipient.address);

        const tokenDataResult = await membership.tokenData(1);

        expect(tokenDataResult).to.be.equal(updatedTokenData);
      });
    });

    describe('#burn', () => {
      it('should update the following mappings', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        const mintTx = await membership.mint(this.recipient.address, tokenData);

        await mintTx.wait();

        const burnTx = await membership.burn(1);

        await burnTx.wait();

        const owner = await membership.tokenOwner(1);

        expect(owner).to.be.equals(AddressZero);

        const data = await membership.tokenData(1);

        expect(data).to.be.equals('0x');
      });
    });
  });
});
