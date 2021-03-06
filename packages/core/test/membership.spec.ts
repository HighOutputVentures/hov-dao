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

  describe('Usable methods: Public', () => {
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

    describe('#tokenURI', () => {
      it('should have the correct decoded tokenURI', async function () {
        const cid =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(cid, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
        });

        await executedTransaction.transactionResponse?.wait();

        const tokenURI = await membership.tokenURI(1);
        console.log(tokenURI);
        expect(tokenURI).to.be.equals(`ipfs://${cid}`);
      });
    });

    describe('#tokenPower', () => {
      it('should have the correct decoded tokenPower', async function () {
        const cid =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';
        const power = 1;

        const tokenData = Buffer.concat([
          Buffer.from(cid, 'ascii'),
          Buffer.from([power]),
        ]);

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
          gasLimit: 400_000,
        });

        await executedTransaction.transactionResponse?.wait();

        const tokenPower = await membership.tokenPower(recipient.address);

        expect(tokenPower).to.be.equals(1);
      });

      it('should return 0 if the owner have no tokens at all', async function () {
        const tokenPower = await membership.tokenPower(recipient.address);

        expect(tokenPower).to.be.equals(0);
      });
    });
  });

  describe('Usable methods: Safe only', () => {
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
      beforeEach(async () => {
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
      });

      it('should be reverted when the sender is not the safe itself', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

        await expect(
          membership.mint(recipient.address, tokenData)
        ).to.be.revertedWith('HOVX001');
      });

      it('should revert when the recipient already have an existing token', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
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
            gasLimit: 400_000,
          })
        ).to.be.revertedWith('GS013');
      });

      it('should have correct tokenData given the tokenId', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
        });

        await executedTransaction.transactionResponse?.wait();

        const tokenDataResult = await membership.tokenData(1);

        expect(tokenDataResult).to.be.equal(`0x${tokenData.toString('hex')}`);
      });

      it('should have the correct owner given the tokenId', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
        });

        await executedTransaction.transactionResponse?.wait();

        const ownerResult = await membership.ownerOf(1);

        expect(ownerResult).to.be.equals(recipient.address);
      });

      it('should have the correct token id given the owner', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
        });

        await executedTransaction.transactionResponse?.wait();

        const ownerTokenResult = await membership.ownerToken(recipient.address);

        expect(ownerTokenResult).to.be.equals(1);
      });

      it('should have the correct decoded tokenURI', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
        });

        await executedTransaction.transactionResponse?.wait();

        const tokenURI = await membership.tokenURI(1);

        expect(tokenURI).to.be.equals(
          'ipfs://bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli'
        );
      });

      it('should have the correct decoded tokenPower', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
        });

        await executedTransaction.transactionResponse?.wait();

        const tokenPower = await membership.tokenPower(recipient.address);

        expect(tokenPower).to.be.equals(1);
      });
    });

    describe('#burn', () => {
      beforeEach(async () => {
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
      });

      it('should be reverted when the sender is not the safe itself', async function () {
        await expect(membership.burn(1)).to.be.revertedWith('HOVX001');
      });

      it('should revert when burning non-existent token', async function () {
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
            gasLimit: 400_000,
          })
        ).revertedWith('GS013');
      });

      it('should revert when getting the owner of the burned token id', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
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
          gasLimit: 400_000,
        });

        await executedBurnTx.transactionResponse?.wait();

        await expect(membership.ownerOf(1)).to.be.reverted;
      });

      it('should the tokenData be address zero when getting the burned token id', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
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
          gasLimit: 400_000,
        });

        await executedBurnTx.transactionResponse?.wait();

        const data = await membership.tokenData(1);

        expect(data).to.be.equals('0x');
      });

      it('should return 0 when getting the ownerToken using the token id', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
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
          gasLimit: 400_000,
        });

        await executedBurnTx.transactionResponse?.wait();

        const token = await membership.ownerToken(recipient.address);

        expect(token).to.be.equals(0);
      });
    });

    describe('#updateToken', () => {
      beforeEach(async () => {
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
      });

      it('should be reverted when the sender is not the safe itself', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

        await expect(
          membership.updateToken(recipient.address, tokenData)
        ).to.be.revertedWith('HOVX001');
      });

      it('should throw an error when the owner have no tokens at all', async function () {
        const updatedIpfsHash = 'HASH';

        const updatedTokenData = Buffer.concat([
          Buffer.from(updatedIpfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
            gasLimit: 400_000,
          })
        ).revertedWith('GS013');
      });

      it('should return address zero when querying the previous token id', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
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
            gasLimit: 400_000,
          }
        );

        await executedUpdateTokenTx.transactionResponse?.wait();

        const noTokenDataResult = await membership.tokenData(1);

        expect(noTokenDataResult).to.be.equal('0x');
      });

      it('should return the updated token data when querying the updated token id', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
        });

        await executedTransaction.transactionResponse?.wait();

        const updatedIpfsHash = 'HASH';

        const updatedTokenData = Buffer.concat([
          Buffer.from(updatedIpfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
            gasLimit: 400_000,
          }
        );

        await executedUpdateTokenTx.transactionResponse?.wait();

        const tokenDataResult = await membership.tokenData(2);

        expect(tokenDataResult).to.be.equal(
          `0x${updatedTokenData.toString('hex')}`
        );
      });

      it('should revert when querying the owner of the previous token id', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
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
            gasLimit: 400_000,
          }
        );

        await executedUpdateTokenTx.transactionResponse?.wait();

        await expect(membership.ownerOf(1)).to.be.reverted;
      });

      it('should return the owner when querying the owner of the updated token id', async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
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
            gasLimit: 400_000,
          }
        );

        await executedUpdateTokenTx.transactionResponse?.wait();

        const tokenOwnerResult = await membership.ownerOf(2);

        expect(tokenOwnerResult).to.be.equals(recipient.address);
      });

      it("should return the token id when querying the owner token using the owner's address", async function () {
        const ipfsHash =
          'bafkreia2m6vdubrbxfws52nj6lfjdzeddkwxccojqutzehamvf4o5rgdli';

        const tokenData = Buffer.concat([
          Buffer.from(ipfsHash, 'ascii'),
          Buffer.from([1]),
        ]);

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
          gasLimit: 400_000,
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
            gasLimit: 400_000,
          }
        );

        await executedUpdateTokenTx.transactionResponse?.wait();

        const ownerTokenResult = await membership.ownerToken(recipient.address);

        expect(ownerTokenResult).to.be.equals(2);
      });
    });
  });
});
