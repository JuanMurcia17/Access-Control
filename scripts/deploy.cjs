const hre = require("hardhat");

async function main() {
  const AccessControlDemo = await hre.ethers.getContractFactory("AccessControlDemo");
  const contract = await AccessControlDemo.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AccessControlDemo deployed to:", address);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  const hasAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log("Deployer has DEFAULT_ADMIN_ROLE:", hasAdmin);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
