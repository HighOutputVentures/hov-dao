// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract Membership is ERC721 {
    mapping(uint256 => bool) public mintedTokenId;

    modifier isDisabled(uint256 tokenId) {
        require(!mintedTokenId[tokenId], "DISABLED");

        _;
    }

    constructor() ERC721("HOV Pass", "HOV") {
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override isDisabled(tokenId) {
        string(abi.encodePacked(from, to, tokenId));
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override isDisabled(tokenId) {
        string(abi.encodePacked(from, to, tokenId));
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override isDisabled(tokenId) {
        string(abi.encodePacked(from, to, tokenId, _data));
    }
    
    function approve(address to, uint256 tokenId) public virtual override {
        string(abi.encodePacked(to, tokenId));
    }

    function setApprovalForAll(address operator, bool approved) public virtual override {
        string(abi.encodePacked(operator, approved));
    }

    function getApproved(uint256 tokenId) public view virtual override isDisabled(tokenId) returns (address) {
        string(abi.encodePacked(tokenId));

        return address(this);
    }

    function isApprovedForAll(address owner, address operator) public view virtual override isDisabled(tokenId) returns (bool) {
        string(abi.encodePacked(owner, operator));

        return false;
    }
}