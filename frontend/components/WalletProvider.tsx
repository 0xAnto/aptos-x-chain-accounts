import { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { setupAutomaticSolanaWalletDerivation } from "@aptos-labs/derived-wallet-solana";
// import { setupAutomaticEthereumWalletDerivation } from "@aptos-labs/derived-wallet-ethereum";
// Internal components
import { useToast } from "@/components/ui/use-toast";
// Internal constants
import { APTOS_API_KEY, NETWORK } from "@/constants";

setupAutomaticSolanaWalletDerivation({ defaultNetwork: NETWORK }); // this is the Aptos network your dapp is working with
//  setupAutomaticEthereumWalletDerivation({ defaultNetwork: NETWORK });

export function WalletProvider({ children }: PropsWithChildren) {
  const { toast } = useToast();

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK, aptosApiKeys: {[NETWORK]: APTOS_API_KEY} }}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
