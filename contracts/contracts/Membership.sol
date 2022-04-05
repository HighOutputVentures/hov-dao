// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./IGnosisSafe.sol";

contract Membership is ERC721 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;

    string public constant IPFS_BASE_URL = "https://ipfs.io/ipfs/";

    string public constant NAME = "Membership";

    string public constant VERSION = "0.0.1";
    
    IGnosisSafe public safe;

    mapping(uint256 => address) public tokenOwner;

    mapping(uint256 => bytes) public tokenData;

    modifier disabledTransferAndApprove() {
        require(false, "disabled!");

        _;
    }

    constructor(IGnosisSafe _safe) ERC721("HOV Pass", "HOV") {
        safe = _safe;
    }

    function mint(address _recipient, bytes memory _tokenData, bytes memory _signatures)
        public
        returns (uint256)
    {
        bytes32 txHash;

        {
            bytes memory txHashData = encodeTransactionData(
                _recipient,
                _tokenData
            );

            txHash = keccak256(txHashData);

            safe.checkSignatures(txHash, txHashData, _signatures);
        }

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        
        _mint(_recipient, newItemId);

        tokenOwner[newItemId] = _recipient;
        tokenData[newItemId] = _tokenData;

        emit Transfer(_recipient, address(safe), newItemId);

        return newItemId;
    }

    function encodeTransactionData(
        address _recipient, 
        bytes memory _tokenData
    )
        public
        pure
        returns (bytes memory)
    {
        return
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                keccak256(
                    abi.encodeWithSignature(
                        "mint(address,bytes,bytes)",
                        _recipient,
                        _tokenData,
                        abi.encodePacked(address(0))
                    )
                )
            );
    }

    function getTransactionHash(
        address _recipient, 
        bytes memory _tokenData
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(encodeTransactionData(_recipient, _tokenData));
    }

    function updateToken(uint256 _tokenId, bytes memory _tokenData, bytes memory _signatures) public returns(bytes memory) {
        bytes32 txHash;

        {
            bytes memory txHashData = encodeUpdatedTokenTransactionData(
                _tokenId,
                _tokenData
            );

            txHash = keccak256(txHashData);

            safe.checkSignatures(txHash, txHashData, _signatures);
        }

        tokenData[_tokenId] = _tokenData;

        return _tokenData;
    }

    function encodeUpdatedTokenTransactionData(
        uint256 _tokenId, 
        bytes memory _tokenData
    )
        public
        pure
        returns (bytes memory)
    {
        return
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                keccak256(
                    abi.encodeWithSignature(
                        "updateToken(uint256,bytes,bytes)",
                        _tokenId,
                        _tokenData,
                        abi.encodePacked(address(0))
                    )
                )
            );
    }

    function getTransactionUpdateTokenHash(
        uint256 _tokenId,
        bytes memory _tokenData
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(encodeUpdatedTokenTransactionData(_tokenId, _tokenData));
    }

    function burn(uint256 _tokenId, bytes memory _signatures) public virtual {
        super._burn(_tokenId);

        address foundTokenOwner = tokenOwner[_tokenId];

         bytes32 txHash;

        {
            bytes memory txHashData = encodeBurnTransactionData(
                _tokenId
            );

            txHash = keccak256(txHashData);

            safe.checkSignatures(txHash, txHashData, _signatures);
        }

        delete tokenOwner[_tokenId];
        delete tokenData[_tokenId];

        emit Transfer(address(safe), foundTokenOwner, _tokenId);
    }

    function encodeBurnTransactionData(
        uint256 _tokenId
    )
        public
        pure
        returns (bytes memory)
    {
        return
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                keccak256(
                    abi.encodeWithSignature(
                        "burn(uint256,bytes)",
                        _tokenId,
                        abi.encodePacked(address(0))
                    )
                )
            );
    }

    function getTransactionBurnHash(
        uint256 _tokenId
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(encodeBurnTransactionData(_tokenId));
    }

    function decodeTokenData(bytes memory _tokenData) public pure returns(string memory) {
        string memory first;

        (first) = abi.decode(_tokenData, (string));

        return first;
    }

    function concat(bytes memory _tokenData) public pure returns(string memory) {
        string memory decodedStr;

        decodedStr = decodeTokenData(_tokenData);

        string memory tokenURI = string(abi.encodePacked(IPFS_BASE_URL, decodedStr));

        return tokenURI;
    }

    function transferFrom(
        address,
        address,
        uint256 _tokenId
    ) public virtual override disabledTransferAndApprove() {}

    function safeTransferFrom(
        address,
        address,
        uint256 _tokenId
    ) public virtual override disabledTransferAndApprove() {}

    function safeTransferFrom(
        address,
        address,
        uint256 _tokenId,
        bytes memory _data
    ) public virtual override disabledTransferAndApprove() {}

    function approve(address, uint256 _tokenId) public virtual override disabledTransferAndApprove() {}
}