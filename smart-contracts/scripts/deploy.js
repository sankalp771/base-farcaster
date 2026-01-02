const hre = require("hardhat");

async function main() {
    console.log("Deploying VirusLab to Base Sepolia...");

    const VirusLab = await hre.ethers.getContractFactory("VirusLab");
    const virusLab = await VirusLab.deploy();

    await virusLab.waitForDeployment();

    const address = await virusLab.getAddress();

    console.log("VirusLab deployed to:", address);
    console.log("-----------------------------------");
    console.log("NEXT STEP: Update hooks/useOnChainEngine.ts with this address!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
