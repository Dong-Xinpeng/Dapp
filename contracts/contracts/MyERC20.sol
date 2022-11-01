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
    uint32 bn = 0;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    }

    function bonus(address to) external {
        _mint(to, bn);
        bn++;
    }
}