// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./IGnosisSafe.sol";

contract Membership is ERC721URIStorage {
    using Counters for Counters.Counter;
    
    string public constant IPFS_BASE_URL = "https://ipfs.io/ipfs/";

    Counters.Counter private _tokenIds;

    string public constant NAME = "Membership";

    string public constant VERSION = "0.0.1";
    
    address public owner;

    mapping(uint256 => bool) public mintedTokens;

    mapping(uint256 => address) public tokenOwner;

    mapping(uint256 => string) public tokenData;

    modifier disabledTransferAndApprove() {
        require(false, "disabled!");

        _;
    }

    constructor(address _owner) ERC721("HOV Pass", "HOV") {
        owner = _owner;
    }

    function mint(address _recipient, bytes memory _tokenData)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        
        _mint(_recipient, newItemId);
        
        string memory tokenURI = concat(_tokenData);
        
        _setTokenURI(newItemId, tokenURI);

        mintedTokens[newItemId] = true;
        tokenOwner[newItemId] = _recipient;
        tokenData[newItemId] = decodeTokenData(_tokenData);

        emit Transfer(owner, _recipient, newItemId);

        return newItemId;
    }

    function updateToken(uint256 _tokenId, bytes memory _tokenData) public returns(bytes memory) {
        string memory tokenURI = concat(_tokenData);

        _setTokenURI(_tokenId, tokenURI);

        tokenData[_tokenId] = decodeTokenData(_tokenData);

        return _tokenData;
    }

    function burn(uint256 _tokenId) public virtual {
        super._burn(_tokenId);

        address foundTokenOwner = tokenOwner[_tokenId];

        delete mintedTokens[_tokenId];
        delete tokenOwner[_tokenId];
        delete tokenData[_tokenId];

        emit Transfer(owner, foundTokenOwner, _tokenId);
    }

    function encodeTokenData(string memory _tokenData) public pure returns(bytes memory) {
        return abi.encode(_tokenData);
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