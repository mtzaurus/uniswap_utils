// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Create a simple token with 100_000_000_000 tokens in supply.
contract TestToken is ERC20 {
    constructor(string memory name, string memory symbol, uint8 decimals)
        ERC20(name, symbol)
    {
        _mint(msg.sender, 1000000000000 * 10 ** uint256(decimals));
    }
}