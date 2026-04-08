// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AccessControlDemo
 * @dev Academic demonstration of OpenZeppelin's AccessControl module.
 *
 * This contract defines three roles:
 * - DEFAULT_ADMIN_ROLE: can grant and revoke any role
 * - MINTER_ROLE: can execute the mint function
 * - BURNER_ROLE: can execute the burn function
 *
 * The deployer receives DEFAULT_ADMIN_ROLE automatically.
 */
contract AccessControlDemo is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Simple counter to track mints and burns for demonstration
    uint256 public totalMinted;
    uint256 public totalBurned;

    // Events for the frontend to listen to
    event Minted(address indexed to, uint256 newTotal);
    event Burned(address indexed from, uint256 newTotal);

    constructor() {
        // The deployer gets the admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Simulates a mint operation. Only callable by accounts with MINTER_ROLE.
     * @param to The address to "mint" to (used for event logging)
     */
    function mint(address to) external onlyRole(MINTER_ROLE) {
        totalMinted += 1;
        emit Minted(to, totalMinted);
    }

    /**
     * @dev Simulates a burn operation. Only callable by accounts with BURNER_ROLE.
     * @param from The address to "burn" from (used for event logging)
     */
    function burn(address from) external onlyRole(BURNER_ROLE) {
        totalBurned += 1;
        emit Burned(from, totalBurned);
    }
}
