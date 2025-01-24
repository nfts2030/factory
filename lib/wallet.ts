import { ThirdwebSDK, isContractDeployed } from "@thirdweb-dev/sdk";
import { SmartWallet, LocalWallet } from "@thirdweb-dev/wallets";
import { TULUMCOIN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS, ACCOUNT_FACTORY_ADDRESS } from "../const/addresses";
import { Optimism } from "@thirdweb-dev/chains";

export function createSmartWallet(): SmartWallet {
    const smartWallet = new SmartWallet({
        chain: Optimism, // Usar la red Optimism
        factoryAddress: ACCOUNT_FACTORY_ADDRESS, // Dirección de la fábrica de cuentas
        gasless: true, // Habilitar transacciones sin gas
        clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID, // Client ID de Thirdweb
    });
    return smartWallet;
};

export async function connectSmartWallet(
    password: string,
    statusCallback: (status: string) => void
): Promise<SmartWallet> {
    statusCallback("Searching for trainer account...");
    const smartWallet = createSmartWallet();
    const personalWallet = new LocalWallet();

    // Cargar o crear la billetera local
    await personalWallet.loadOrCreate({
        strategy: "encryptedJson",
        password: password,
    });

    // Conectar la billetera local a la SmartWallet
    await smartWallet.connect({
        personalWallet
    });

    const sdk = await ThirdwebSDK.fromWallet(
        smartWallet,
        Optimism, // Usar la red Optimism
        {
            clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID,
        }
    );

    const address = await sdk.wallet.getAddress();
    const isDeployed = await isContractDeployed(
        address,
        sdk.getProvider(),
    );

    if (!isDeployed) {
        statusCallback("New account detected...");
        const monsterContract = await sdk.getContract(TULUMCOIN_CONTRACT_ADDRESS);
        const tokenContract = await sdk.getContract(TOKEN_CONTRACT_ADDRESS);

        statusCallback("Creating new account...");
        const tx1 = await monsterContract.erc1155.claim.prepare(0, 1);
        const tx2 = await tokenContract.erc20.claim.prepare(100);
        const transactions = [tx1, tx2];

        statusCallback("Sending starter monster and initial funds...");
        const batchTx = await smartWallet.executeBatch(transactions);
    } else {
        statusCallback("Trainer account found! Loading monsters...");
    }
    return smartWallet;
};