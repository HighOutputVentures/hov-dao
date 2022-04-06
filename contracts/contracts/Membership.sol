// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import "./IGnosisSafe.sol";

contract Membership is ERC721 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;

    string public constant IPFS_BASE_URL = "https://ipfs.io/ipfs/";

    string public constant NAME = "Membership";

    string public constant VERSION = "0.0.1";
    
    IGnosisSafe public safe;

    /// @dev maps token id to token data
    mapping(uint256 => bytes) public tokenData;

    /// @dev maps owner to the token id
    mapping(address => uint256) public ownerToken;

    /// @dev HOVX001 - Only the safe can call this contract
    modifier safeOnly() {
        require(msg.sender == address(safe), "HOVX001");

        _;
    }

    /// @dev HOVX002 - transfer and approved is disabled
    modifier disabledTransferAndApprove() {
        require(false, "HOVX002");

        _;
    }

    constructor(IGnosisSafe _safe) ERC721("HOV Pass", "HOVX") {
        safe = _safe;
    }

    function _hovMint(address _recipient, bytes memory _tokenData) private returns(uint256) {
        require(balanceOf(_recipient) == 0, "recipient has existing token");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        super._mint(_recipient, newItemId);

        tokenData[newItemId] = _tokenData;
        ownerToken[_recipient] = newItemId;

        return newItemId;
    }

    function mint(address _recipient, bytes memory _tokenData) 
        public
        safeOnly
        returns(uint256)
    {
        return _hovMint(_recipient, _tokenData);
    }

    function burn(uint256 _tokenId) public safeOnly {
        require(_exists(_tokenId), "cannot burn non-existent token");

        address owner = ownerOf(_tokenId);

        _burn(_tokenId);

        delete tokenData[_tokenId];
        delete ownerToken[owner];
    }

    function updateToken(address _owner, bytes memory _tokenData) 
        public
        safeOnly
        returns(uint256) {
        uint256 tokenId = ownerToken[_owner];

        burn(tokenId);

        return _hovMint(_owner, _tokenData);
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