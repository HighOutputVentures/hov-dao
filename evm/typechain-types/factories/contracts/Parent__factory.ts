/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Parent, ParentInterface } from "../../contracts/Parent";

const _abi = [
  {
    inputs: [],
    name: "approved",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060b68061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c806319d40b0814602d575b600080fd5b60336047565b604051603e9190605d565b60405180910390f35b60006001905090565b6057816076565b82525050565b6000602082019050607060008301846050565b92915050565b600081905091905056fea26469706673582212204ded2420a73fb3720015dbea90baa245c00ff6a52be852d935de7aa8e8a7cc0664736f6c63430008040033";

type ParentConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ParentConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Parent__factory extends ContractFactory {
  constructor(...args: ParentConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Parent> {
    return super.deploy(overrides || {}) as Promise<Parent>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Parent {
    return super.attach(address) as Parent;
  }
  override connect(signer: Signer): Parent__factory {
    return super.connect(signer) as Parent__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ParentInterface {
    return new utils.Interface(_abi) as ParentInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Parent {
    return new Contract(address, _abi, signerOrProvider) as Parent;
  }
}