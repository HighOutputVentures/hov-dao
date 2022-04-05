import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import Safe from '@gnosis.pm/safe-core-sdk';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, constants } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

const { AbiCoder } = ethers.utils;
const { AddressZero } = constants;

const abiCoder = new AbiCoder();

describe('Membership', function () {
  describe('Disabled methods', () => {
    let membership: Contract;
    let signer: SignerWithAddress;
    let recipient: SignerWithAddress;

    beforeEach(async function () {
      [signer, recipient] = await ethers.getSigners();

      const ethAdapter = new EthersAdapter({
        ethers,
        signer,
      });

      const GnosisSafeMasterCopy = await ethers.getContractFactory(
        'GnosisSafe',
        signer
      );

      const gnosisSafeMasterCopy = await GnosisSafeMasterCopy.deploy();

      const GnosisSafeProxy = await ethers.getContractFactory(
        'GnosisSafeProxy',
        signer
      );
      const proxy = await GnosisSafeProxy.deploy(gnosisSafeMasterCopy.address);

      await proxy.deployed();

      const copy = GnosisSafeMasterCopy.attach(proxy.address);
      await copy.setup(
        [signer.address],
        1,
        AddressZero,
        '0x',
        AddressZero,
        AddressZero,
        0,
        AddressZero
      );

      this.gnosisSafe = copy;

      const safeSdk: Safe = await Safe.create({
        ethAdapter,
        safeAddress: proxy.address,
      });

      this.safeSdk = safeSdk;

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

        const txHash = await membership.getTransactionHash(
          recipient.address,
          tokenData
        );

        const firstSafeSignature = await this.safeSdk.signTransactionHash(
          txHash
        );

        const signatureBytes = ethers.utils.solidityPack(
          ['bytes'],
          [firstSafeSignature.data]
        );

        const mintTx = await membership.mint(
          recipient.address,
          tokenData,
          signatureBytes
        );

        await mintTx.wait();

        const tokenDataResult = await membership.tokenData(1);

        expect(tokenDataResult).to.be.equal(tokenData);

        const tokenOwnerResult = await membership.tokenOwner(1);

        expect(tokenOwnerResult).to.be.equals(recipient.address);
      });
    });

    describe('#update', () => {
      it('should update the following mappings', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        const txHash = await membership.getTransactionHash(
          recipient.address,
          tokenData
        );

        const firstSafeSignature = await this.safeSdk.signTransactionHash(
          txHash
        );

        const signatureBytes = ethers.utils.solidityPack(
          ['bytes'],
          [firstSafeSignature.data]
        );

        const mintTx = await membership.mint(
          recipient.address,
          tokenData,
          signatureBytes
        );

        await mintTx.wait();

        const updatedIpfsHash = 'HASH';

        const updatedTokenData = abiCoder.encode(['string'], [updatedIpfsHash]);

        const updateTokenTxHash =
          await membership.getTransactionUpdateTokenHash(1, updatedTokenData);

        const firstUpdateTokenSignature =
          await this.safeSdk.signTransactionHash(updateTokenTxHash);

        const updateSignatureBytes = ethers.utils.solidityPack(
          ['bytes'],
          [firstUpdateTokenSignature.data]
        );

        const updateTokenTx = await membership.updateToken(
          1,
          updatedTokenData,
          updateSignatureBytes
        );

        await updateTokenTx.wait();

        const tokenOwnerResult = await membership.tokenOwner(1);

        expect(tokenOwnerResult).to.be.equals(recipient.address);

        const tokenDataResult = await membership.tokenData(1);

        expect(tokenDataResult).to.be.equal(updatedTokenData);
      });
    });

    describe('#burn', () => {
      it('should update the following mappings', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        const txHash = await membership.getTransactionHash(
          recipient.address,
          tokenData
        );

        const firstSafeSignature = await this.safeSdk.signTransactionHash(
          txHash
        );

        const signatureBytes = ethers.utils.solidityPack(
          ['bytes'],
          [firstSafeSignature.data]
        );

        const mintTx = await membership.mint(
          recipient.address,
          tokenData,
          signatureBytes
        );

        await mintTx.wait();

        const burnTxHash = await membership.getTransactionBurnHash(1);

        const firstBurnSignature = await this.safeSdk.signTransactionHash(
          burnTxHash
        );

        const burnSignatureBytes = ethers.utils.solidityPack(
          ['bytes'],
          [firstBurnSignature.data]
        );

        const burnTx = await membership.burn(1, burnSignatureBytes);

        await burnTx.wait();

        const owner = await membership.tokenOwner(1);

        expect(owner).to.be.equals(AddressZero);

        const data = await membership.tokenData(1);

        expect(data).to.be.equals('0x');
      });
    });
  });
});
