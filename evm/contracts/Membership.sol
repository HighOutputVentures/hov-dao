// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./IGnosisSafe.sol";

/// @dev smart contract must implement ERC721 Standard
/// @dev transfer and approval operations must be disabled. once minted, tokens cannot be transferred to another address
/// @dev DAO must be able to mint new tokens. the minting of new tokens equates to membership into the DAO
    /// @dev There's no indicator for the membership during minting
/// @dev DAO must be able to burn existing tokens. burning of tokens equates to kicking out from the DAO
    /// @dev There's still no indicator for kicking out a member
/// @dev DAO must be able to update the token (change the tokenURI)
contract Membership is ERC721URIStorage {
    using Counters for Counters.Counter;

    string public constant NAME = "Membership";

    string public constant VERSION = "0.0.1";
    
    address public owner;
    
    Counters.Counter private _tokenIds;

    mapping(uint256 => bool) public mintedTokens;

    mapping(uint256 => address) public tokenOwner;

    mapping(uint256 => string) public tokenURIs;

    modifier disabledTransferAndApprove() {
        require(false, "transfer and approve are disabled");

        _;
    }

    constructor(address _owner) ERC721("HOV Pass", "HOV") {
        owner = _owner;
    }

    function mint(address _owner, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        
        _mint(_owner, newItemId);
        _setTokenURI(newItemId, tokenURI);

        mintedTokens[newItemId] = true;
        tokenOwner[newItemId] = _owner;
        tokenURIs[newItemId] = tokenURI;

        return newItemId;
    }

    function updateToken(uint256 _tokenId, string memory _tokenURI) public returns(string memory) {
        _setTokenURI(_tokenId, _tokenURI);

        tokenURIs[_tokenId] = _tokenURI;

        return _tokenURI;
    }

    function burn(uint256 _tokenId) public virtual {
        super._burn(_tokenId);

        delete mintedTokens[_tokenId];
        delete tokenOwner[_tokenId];
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