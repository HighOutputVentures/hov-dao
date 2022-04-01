// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract Membership is ERC721 {
    constructor() ERC721("HOV Pass", "HOV") {
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        string(abi.encodePacked(from, to, tokenId));

        require(false, "DISABLED");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        string(abi.encodePacked(from, to, tokenId));

        require(false, "DISABLED");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        string(abi.encodePacked(from, to, tokenId, _data));

        require(false, "DISABLED");
    }
    
    function approve(address to, uint256 tokenId) public virtual override {
        string(abi.encodePacked(to, tokenId));

        require(false, "DISABLED");
    }

    function setApprovalForAll(address operator, bool approved) public virtual override {
        string(abi.encodePacked(operator, approved));

        require(false, "DISABLED");
    }

    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        string(abi.encodePacked(tokenId));

        require(false, "DISABLED");

        return address(this);
    }

    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        string(abi.encodePacked(owner, operator));

        require(false, "DISABLED");

        return false;
    }
}