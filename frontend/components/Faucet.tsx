import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal components
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
export function Faucet() {
  const { account } = useWallet();

  const onClickButton = async () => {
    if (!account) {
      return;
    }

    try {
      const committedTransaction = await aptosClient().fundAccount({
        accountAddress: account.address,
        amount: 100000000,
      });
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      toast({
        title: "Success",
        description: `Account funded with faucet, hash: ${executedTransaction.hash}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
      <Button disabled={!account} onClick={onClickButton} >
        Faucet
      </Button>
      
  );
}
