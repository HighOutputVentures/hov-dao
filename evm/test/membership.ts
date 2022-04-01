import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

describe('Membership', function () {
  describe('Disabled methods', () => {
    let membership: Contract;

    beforeEach(async () => {
      const Membership = await ethers.getContractFactory('Membership');
      membership = await Membership.deploy();

      await membership.deployed();
    });

    describe('#approved', () => {
      it('should be disabled', async function () {
        await expect(membership.approve(membership.address, 1)).reverted;
      });
    });

    describe('#setApprovalForAll', () => {
      it('should be disabled', async function () {
        await expect(membership.setApprovalForAll(membership.address, true))
          .reverted;
      });
    });

    describe('#getApproved', () => {
      it('should be disabled', async function () {
        await expect(membership.getApproved(1)).reverted;
      });
    });

    describe('#isApprovedAll', () => {
      it('should be disabled', async function () {
        await expect(
          membership.isApprovedForAll(membership.address, membership.address)
        ).reverted;
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
});
