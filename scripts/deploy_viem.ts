import { createWalletClient, http, parseEther, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'
import fs from 'fs'
import path from 'path'
// @ts-ignore
import solc from 'solc'

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in environment variables.");
    process.exit(1);
}

async function main() {
    console.log("🚀 Starting Zero-Config Deployment (Viem + Solc)...");

    // 1. Read Contract
    const contractPath = path.resolve(process.cwd(), 'contracts', 'VirusLab.sol');
    if (!fs.existsSync(contractPath)) {
        console.error(`❌ Contract not found at: ${contractPath}`);
        process.exit(1);
    }
    const source = fs.readFileSync(contractPath, 'utf8');
    console.log("📄 Contract Source Loaded.");

    // 2. Compile Contract
    const input = {
        language: 'Solidity',
        sources: {
            'VirusLab.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    console.log("🔨 Compiling...");
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        let hasError = false;
        output.errors.forEach((err: any) => {
            if (err.severity === 'error') {
                console.error(`❌ Compilation Error: ${err.message}`);
                hasError = true;
            } else {
                console.warn(`⚠️ Warning: ${err.message}`);
            }
        });
        if (hasError) process.exit(1);
    }

    const contractFile = output.contracts['VirusLab.sol']['VirusLab'];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;
    console.log("✅ Compilation Successful!");

    // 3. Configure Wallet
    const account = privateKeyToAccount(`0x${PRIVATE_KEY.replace(/^0x/, '')}`);
    console.log(`👤 Deploying from: ${account.address}`);

    const client = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http()
    }).extend(publicActions);

    // 4. Deploy
    console.log("📤 Sending Deployment Transaction...");
    const hash = await client.deployContract({
        abi,
        bytecode: `0x${bytecode}`,
        args: [] // value is not needed for constructor
    });

    console.log(`⏳ Transaction sent: ${hash}`);
    console.log("Waiting for confirmation...");

    const receipt = await client.waitForTransactionReceipt({ hash });

    if (receipt.contractAddress) {
        console.log("----------------------------------------------------");
        console.log(`🎉 SUCCESS! Contract Deployed to: ${receipt.contractAddress}`);
        console.log("----------------------------------------------------");
        console.log("👉 Update 'hooks/useOnChainEngine.ts' with this address.");
    } else {
        console.error("❌ Deployment failed: No contract address returned.");
    }
}

main().catch(console.error);
