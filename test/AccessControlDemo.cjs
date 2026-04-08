const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessControlDemo", function () {
  let contract;
  let admin;
  let user1;
  let user2;
  let MINTER_ROLE;
  let BURNER_ROLE;
  let DEFAULT_ADMIN_ROLE;

  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();

    const AccessControlDemo = await ethers.getContractFactory("AccessControlDemo");
    contract = await AccessControlDemo.deploy();
    await contract.waitForDeployment();

    MINTER_ROLE = await contract.MINTER_ROLE();
    BURNER_ROLE = await contract.BURNER_ROLE();
    DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  });

  describe("Deployment", function () {
    it("should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should NOT grant MINTER_ROLE to deployer", async function () {
      expect(await contract.hasRole(MINTER_ROLE, admin.address)).to.be.false;
    });

    it("should NOT grant BURNER_ROLE to deployer", async function () {
      expect(await contract.hasRole(BURNER_ROLE, admin.address)).to.be.false;
    });
  });

  describe("Mint function", function () {
    it("should FAIL if caller does NOT have MINTER_ROLE", async function () {
      await expect(
        contract.connect(user1).mint(user2.address)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("should SUCCEED if caller HAS MINTER_ROLE", async function () {
      // Admin grants MINTER_ROLE to user1
      await contract.grantRole(MINTER_ROLE, user1.address);

      // user1 can now mint
      await expect(contract.connect(user1).mint(user2.address))
        .to.emit(contract, "Minted")
        .withArgs(user2.address, 1);

      expect(await contract.totalMinted()).to.equal(1);
    });
  });

  describe("Burn function", function () {
    it("should FAIL if caller does NOT have BURNER_ROLE", async function () {
      await expect(
        contract.connect(user1).burn(user2.address)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("should SUCCEED if caller HAS BURNER_ROLE", async function () {
      await contract.grantRole(BURNER_ROLE, user1.address);

      await expect(contract.connect(user1).burn(user2.address))
        .to.emit(contract, "Burned")
        .withArgs(user2.address, 1);

      expect(await contract.totalBurned()).to.equal(1);
    });
  });

  describe("Role management", function () {
    it("should allow admin to grant and revoke roles", async function () {
      // Grant MINTER_ROLE
      await contract.grantRole(MINTER_ROLE, user1.address);
      expect(await contract.hasRole(MINTER_ROLE, user1.address)).to.be.true;

      // Revoke MINTER_ROLE
      await contract.revokeRole(MINTER_ROLE, user1.address);
      expect(await contract.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    });

    it("should FAIL when non-admin tries to grant roles", async function () {
      await expect(
        contract.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("should FAIL to mint after role is revoked", async function () {
      // Grant then revoke
      await contract.grantRole(MINTER_ROLE, user1.address);
      await contract.revokeRole(MINTER_ROLE, user1.address);

      // Should fail now
      await expect(
        contract.connect(user1).mint(user2.address)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });
  });
});
