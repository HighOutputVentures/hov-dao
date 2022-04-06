// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IGnosisSafe.sol";

contract Membership is ERC721 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;

    string public constant IPFS_BASE_URL = "https://ipfs.io/ipfs/";
    
    IGnosisSafe public safe;

    // Mapping from token ID to data
    mapping(uint256 => bytes) public tokenData;

    // Mapping from owner address to token ID
    mapping(address => uint256) public tokens;

    modifier disabledTransferAndApprove() {
        require(false, "disabled!");
        _;
    }

    modifier onlySafe {
      require(msg.sender == address(safe), "not safe");
      _;
   }

    constructor(IGnosisSafe _safe) ERC721("HOVX Pass", "HOVX") {
        safe = _safe;
    }

    function _mintL(address _recipient, bytes memory _tokenData)
        private
        returns (uint256)
    {
        require(tokens[_recipient] == 0, "recipient has existing token");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        
        tokenData[newItemId] = _tokenData;
        tokens[_recipient] = newItemId;

        _mint(_recipient, newItemId);

        return newItemId;
    } 

    function mint(address _recipient, bytes memory _tokenData)
        public
        returns (uint256)
    {
        uint256 newItemId = _mintL(_recipient, _tokenData);        

        return newItemId;
    }

    function _burnL(uint256 _tokenId) private {
        require(_exists(_tokenId), "cannot burn nonexistent token");

        address owner = ownerOf(_tokenId);

        delete tokenData[_tokenId];
        delete tokens[owner];

        _burn(_tokenId);
    }

    function burn(uint256 _tokenId) public virtual {
        _burnL(_tokenId);
    }

    function updateTokenData(address _owner, bytes memory _tokenData) public returns (uint256) {
        uint256 tokenId = tokens[_owner];

        _burnL(tokenId);

        uint256 newTokenId = _mintL(_owner, _tokenData);

        return newTokenId;
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