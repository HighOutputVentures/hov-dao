// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "./IGnosisSafe.sol";

contract Membership is ERC721URIStorage {
    string public constant NAME = "Membership";

    string public constant VERSION = "0.0.1";

    uint256 public tokenCounter;

    address public owner;

    mapping(uint256 => bool) public mintedTokens;

    modifier onlyNonMintedToken(uint256 _tokenId) {
        require(!mintedTokens[_tokenId], "Disabled");

        _;
    }

    constructor(address _owner) ERC721("HOV Pass", "HOV") {
        owner = _owner;
    }

    function executeMint(
        IGnosisSafe _safe,
        uint256 _tokenId, 
        string memory _tokenURI
    ) external {
        mint(_safe, _tokenId, _tokenURI);
    }

    function mint(
        IGnosisSafe safe,
        uint256 _tokenId, 
        string memory tokenURI
    ) private {
        bytes memory data = abi.encodeWithSignature(
            "createNFT(uint256,string)",
            _tokenId,
            tokenURI
        );

        require(
            safe.execTransactionFromModule(
                _tokenId,
                0,
                data,
                Enum.Operation.Call
            ),
            "Cannot execute token minting."
        );
    }

    function createNFT(uint256 _tokenId, string memory tokenURI) public onlyNonMintedToken(_tokenId) returns (uint256) {
        _mint(owner, _tokenId);
        _setTokenURI(_tokenId, tokenURI);

        return _tokenId;
    }

    function transferFrom(
        address from,
        address to,
        uint256 _tokenId
    ) public virtual override onlyNonMintedToken(_tokenId) {
        string(abi.encodePacked(from, to, _tokenId));

        require(false, "DISABLED");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 _tokenId
    ) public virtual override onlyNonMintedToken(_tokenId) {
        string(abi.encodePacked(from, to, _tokenId));

        require(false, "DISABLED");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 _tokenId,
        bytes memory _data
    ) public virtual override onlyNonMintedToken(_tokenId) {
        string(abi.encodePacked(from, to, _tokenId, _data));

        require(false, "DISABLED");
    }
    
    function approve(address to, uint256 _tokenId) public virtual override onlyNonMintedToken(_tokenId) {
        string(abi.encodePacked(to, _tokenId));

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

    function isApprovedForAll(address _owner, address operator) public view virtual override returns (bool) {
        string(abi.encodePacked(_owner, operator));

        require(false, "DISABLED");

        return false;
    }

    function burn(uint256 _tokenId) internal virtual onlyNonMintedToken(_tokenId) {
        super._burn(_tokenId);
    }
}