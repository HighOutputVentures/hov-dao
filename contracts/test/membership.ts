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

    beforeEach(async function () {
      [signer] = await ethers.getSigners();

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
  });

  describe('Usable methods', () => {
    let membership: Contract;
    let signer: SignerWithAddress;
    let recipient: SignerWithAddress;
    let safe: Safe;

    const encodeTransactionData = (args: {
      fn: string;
      abi: string[];
      values: any[];
    }) => {
      const iFace = new ethers.utils.Interface(args.abi);

      return iFace.encodeFunctionData(args.fn, args.values);
    };

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

      safe = safeSdk;

      const Membership = await ethers.getContractFactory('Membership', signer);

      membership = await Membership.deploy(safeSdk.getAddress());

      await membership.deployed();
    });

    describe('#mint', () => {
      it('should be reverted when the sender is not the safe itself', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        await expect(
          membership.mint(recipient.address, tokenData)
        ).to.be.revertedWith('HOVX001');
      });

      it('should apply the correct mapping', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        await signer.sendTransaction({
          to: safe.getAddress(),
          value: ethers.utils.parseEther('1.0'),
        });

        const enableModuleTxData = await safe.createTransaction([
          {
            to: safe.getAddress(),
            value: '0',
            data: encodeTransactionData({
              fn: 'enableModule',
              abi: ['function enableModule(address)'],
              values: [membership.address],
            }),
          },
        ]);

        await safe.signTransaction(enableModuleTxData);

        const executedEnableModuleTx = await safe.executeTransaction(
          enableModuleTxData
        );

        await executedEnableModuleTx.transactionResponse?.wait();

        const txData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'mint',
              abi: ['function mint(address,bytes)'],
              values: [recipient.address, tokenData],
            }),
          },
        ]);

        const executedTransaction = await safe.executeTransaction(txData, {
          gasLimit: 350000,
        });

        await executedTransaction.transactionResponse?.wait();

        const tokenDataResult = await membership.tokenData(1);

        expect(tokenDataResult).to.be.equal(tokenData);

        const ownerResult = await membership.ownerOf(1);

        expect(ownerResult).to.be.equals(recipient.address);

        const ownerTokenResult = await membership.ownerToken(recipient.address);

        expect(ownerTokenResult).to.be.equals(1);

        const tokenURI = await membership.tokenURI(1);

        expect(tokenURI).to.be.equals(
          'https://ipfs.io/ipfs/QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo'
        );
      });

      it('should revert when the recipient already have an existing token', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        await signer.sendTransaction({
          to: safe.getAddress(),
          value: ethers.utils.parseEther('1.0'),
        });

        const enableModuleTxData = await safe.createTransaction([
          {
            to: safe.getAddress(),
            value: '0',
            data: encodeTransactionData({
              fn: 'enableModule',
              abi: ['function enableModule(address)'],
              values: [membership.address],
            }),
          },
        ]);

        await safe.signTransaction(enableModuleTxData);

        const executedEnableModuleTx = await safe.executeTransaction(
          enableModuleTxData
        );

        await executedEnableModuleTx.transactionResponse?.wait();

        const txData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'mint',
              abi: ['function mint(address,bytes)'],
              values: [recipient.address, tokenData],
            }),
          },
        ]);

        const executedTransaction = await safe.executeTransaction(txData, {
          gasLimit: 350000,
        });

        await executedTransaction.transactionResponse?.wait();

        const badTxData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'mint',
              abi: ['function mint(address,bytes)'],
              values: [recipient.address, tokenData],
            }),
          },
        ]);

        await expect(
          safe.executeTransaction(badTxData, {
            gasLimit: 350000,
          })
        ).to.be.revertedWith('GS013');
      });
    });

    describe('#burn', () => {
      it('should be reverted when the sender is not the safe itself', async function () {
        await expect(membership.burn(1)).to.be.revertedWith('HOVX001');
      });

      it('should update the following mappings', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        await signer.sendTransaction({
          to: safe.getAddress(),
          value: ethers.utils.parseEther('1.0'),
        });

        const enableModuleTxData = await safe.createTransaction([
          {
            to: safe.getAddress(),
            value: '0',
            data: encodeTransactionData({
              fn: 'enableModule',
              abi: ['function enableModule(address)'],
              values: [membership.address],
            }),
          },
        ]);

        await safe.signTransaction(enableModuleTxData);

        const executedEnableModuleTx = await safe.executeTransaction(
          enableModuleTxData
        );

        await executedEnableModuleTx.transactionResponse?.wait();

        const txData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'mint',
              abi: ['function mint(address,bytes)'],
              values: [recipient.address, tokenData],
            }),
          },
        ]);

        const executedTransaction = await safe.executeTransaction(txData, {
          gasLimit: 350000,
        });

        await executedTransaction.transactionResponse?.wait();

        const burnTxData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'burn',
              abi: ['function burn(uint256)'],
              values: [1],
            }),
          },
        ]);

        const executedBurnTx = await safe.executeTransaction(burnTxData, {
          gasLimit: 350000,
        });

        await executedBurnTx.transactionResponse?.wait();

        await expect(membership.ownerOf(1)).to.be.reverted;

        const data = await membership.tokenData(1);

        expect(data).to.be.equals('0x');

        const token = await membership.ownerToken(recipient.address);

        expect(token).to.be.equals(0);
      });

      it('should revert when burning non-existent token', async function () {
        await signer.sendTransaction({
          to: safe.getAddress(),
          value: ethers.utils.parseEther('1.0'),
        });

        const enableModuleTxData = await safe.createTransaction([
          {
            to: safe.getAddress(),
            value: '0',
            data: encodeTransactionData({
              fn: 'enableModule',
              abi: ['function enableModule(address)'],
              values: [membership.address],
            }),
          },
        ]);

        await safe.signTransaction(enableModuleTxData);

        const executedEnableModuleTx = await safe.executeTransaction(
          enableModuleTxData
        );

        await executedEnableModuleTx.transactionResponse?.wait();

        const burnTxData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'burn',
              abi: ['function burn(uint256)'],
              values: [1],
            }),
          },
        ]);

        await expect(
          safe.executeTransaction(burnTxData, {
            gasLimit: 350000,
          })
        ).revertedWith('GS013');
      });
    });

    describe('#updateToken', () => {
      it('should be reverted when the sender is not the safe itself', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        await expect(
          membership.updateToken(recipient.address, tokenData)
        ).to.be.revertedWith('HOVX001');
      });

      it('should throw an error when the owner have no tokens at all', async function () {
        await signer.sendTransaction({
          to: safe.getAddress(),
          value: ethers.utils.parseEther('1.0'),
        });

        const enableModuleTxData = await safe.createTransaction([
          {
            to: safe.getAddress(),
            value: '0',
            data: encodeTransactionData({
              fn: 'enableModule',
              abi: ['function enableModule(address)'],
              values: [membership.address],
            }),
          },
        ]);

        await safe.signTransaction(enableModuleTxData);

        const executedEnableModuleTx = await safe.executeTransaction(
          enableModuleTxData
        );

        await executedEnableModuleTx.transactionResponse?.wait();

        const updatedIpfsHash = 'HASH';

        const updatedTokenData = abiCoder.encode(['string'], [updatedIpfsHash]);

        const updateTokenTxData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'updateToken',
              abi: ['function updateToken(address,bytes)'],
              values: [recipient.address, updatedTokenData],
            }),
          },
        ]);

        await expect(
          safe.executeTransaction(updateTokenTxData, {
            gasLimit: 350000,
          })
        ).revertedWith('GS013');
      });

      it('should update the following mappings', async function () {
        const ipfsHash = 'QmfAvnM89JrqvdhLymbU5sXoAukEJygSLk9cJMBPTyrmxo';

        const tokenData = abiCoder.encode(['string'], [ipfsHash]);

        await signer.sendTransaction({
          to: safe.getAddress(),
          value: ethers.utils.parseEther('1.0'),
        });

        const enableModuleTxData = await safe.createTransaction([
          {
            to: safe.getAddress(),
            value: '0',
            data: encodeTransactionData({
              fn: 'enableModule',
              abi: ['function enableModule(address)'],
              values: [membership.address],
            }),
          },
        ]);

        await safe.signTransaction(enableModuleTxData);

        const executedEnableModuleTx = await safe.executeTransaction(
          enableModuleTxData
        );

        await executedEnableModuleTx.transactionResponse?.wait();

        const txData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'mint',
              abi: ['function mint(address,bytes)'],
              values: [recipient.address, tokenData],
            }),
          },
        ]);

        const executedTransaction = await safe.executeTransaction(txData, {
          gasLimit: 350000,
        });

        await executedTransaction.transactionResponse?.wait();

        const updatedIpfsHash = 'HASH';

        const updatedTokenData = abiCoder.encode(['string'], [updatedIpfsHash]);

        const updateTokenTxData = await safe.createTransaction([
          {
            to: membership.address,
            value: '0',
            data: encodeTransactionData({
              fn: 'updateToken',
              abi: ['function updateToken(address,bytes)'],
              values: [recipient.address, updatedTokenData],
            }),
          },
        ]);

        const executedUpdateTokenTx = await safe.executeTransaction(
          updateTokenTxData,
          {
            gasLimit: 350000,
          }
        );

        await executedUpdateTokenTx.transactionResponse?.wait();

        const noTokenDataResult = await membership.tokenData(1);

        expect(noTokenDataResult).to.be.equal('0x');

        const tokenDataResult = await membership.tokenData(2);

        expect(tokenDataResult).to.be.equal(updatedTokenData);

        await expect(membership.ownerOf(1)).to.be.reverted;

        const tokenOwnerResult = await membership.ownerOf(2);

        expect(tokenOwnerResult).to.be.equals(recipient.address);

        const ownerTokenResult = await membership.ownerToken(recipient.address);

        expect(ownerTokenResult).to.be.equals(2);
      });
    });
  });
});
