// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyERC20 is ERC20 {

    mapping(address => bool) claimedAirdropPlayerList;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100000);
    }

    function airdrop() external {
        require(claimedAirdropPlayerList[msg.sender] == false, "This user has claimed airdrop already");
        _mint(msg.sender, 10000);
        claimedAirdropPlayerList[msg.sender] = true;
    }
}

contract MyERC721 is ERC721 {

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        for(uint32 a = 0;a<=20;a++)
        {
            _mint(msg.sender, a);
        }
    //    _mint(msg.sender, 20);
    }

    // function mint(address _recipient, string memory _tokenUrl) public returns(uint _mintTokenId){
    //     require(bytes(_tokenUrl).length > 0,"The _tokenUrl must be have");
    //     _tokenId.increment();
    //     uint newTokenId = _tokenId.current();
    //     _mint(_recipient, newTokenId);
    //     _setTokenURI(newTokenId, _tokenUrl);
    //     return newTokenId;
    // }

    function bonus(address from,address to,uint32 num) external {
        _transfer(from,to,num);
    }
}