
import { FEE_PAYER_KEY } from "@/constants";
import { Account, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk";
import { NetworkInfo, isAptosNetwork } from "@aptos-labs/wallet-adapter-react";

export const isValidNetworkName = (network: NetworkInfo | null) => {
  if (isAptosNetwork(network)) {
    return Object.values<string | undefined>(Network).includes(network?.name);
  }
  // If the configured network is not an Aptos network, i.e is a custom network
  // we resolve it as a valid network name
  return true;
};

// Generate a sponsor account or use an existing account
const privateKey = new Ed25519PrivateKey(
  PrivateKey.formatPrivateKey(
    FEE_PAYER_KEY,
    PrivateKeyVariants.Ed25519
  )
);

export const feepayerAccount = Account.fromPrivateKey({ privateKey });

console.log("feepayerAccount",feepayerAccount.accountAddress.toString())