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

    function mint(address _recipient, bytes memory _tokenData)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        
        _mint(_recipient, newItemId);

        tokenOwner[newItemId] = _recipient;
        tokenData[newItemId] = _tokenData;

        emit Transfer(_recipient, address(safe), newItemId);

        return newItemId;
    }

    function updateToken(uint256 _tokenId, bytes memory _tokenData) public returns(bytes memory) {
        tokenData[_tokenId] = _tokenData;

        return _tokenData;
    }

    function burn(uint256 _tokenId) public virtual {
        super._burn(_tokenId);

        address foundTokenOwner = tokenOwner[_tokenId];

        delete tokenOwner[_tokenId];
        delete tokenData[_tokenId];

        emit Transfer(address(safe), foundTokenOwner, _tokenId);
    }
    
    function encodeTransactionData(
        address _safe, 
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
                        "mint(address,address,bytes)",
                        _safe,
                        _recipient,
                        _tokenData,
                        abi.encodePacked(address(0))
                    )
                )
            );
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