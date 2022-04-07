import assert from 'assert';
import { ethers } from 'hardhat';

async function main() {
  const { GNOSIS_SAFE_CONTRACT_ADDRESS } = process.env;

  assert(
    GNOSIS_SAFE_CONTRACT_ADDRESS,
    'Gnosis Safe contract address is not supplied'
  );

  const Membership = await ethers.getContractFactory('Membership');
  const contract = await Membership.deploy(GNOSIS_SAFE_CONTRACT_ADDRESS);

  await contract.deployed();

  console.log({
    address: contract.address,
    signer: await contract.signer.getAddress(),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
