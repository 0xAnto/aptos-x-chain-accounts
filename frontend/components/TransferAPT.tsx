import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Internal components
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccountAPTBalance } from "@/view-functions/getAccountBalance";
import { feepayerAccount as secondAccount } from "@/utils/helpers";
import { transferAPT } from "@/entry-functions/transferAPT";

export function TransferAPT() {
  const { account, signTransaction, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const [aptBalance, setAptBalance] = useState<number>(0);
  const [recipient, setRecipient] = useState<string>();
  const [transferAmount, setTransferAmount] = useState<number>();

  const { data } = useQuery({
    queryKey: ["apt-balance", account?.address],
    refetchInterval: 10_000,
    queryFn: async () => {
      try {
        if (account === null) {
          console.error("Account not available");
        }

        const balance = await getAccountAPTBalance({ accountAddress: account!.address.toStringLong() });

        return {
          balance,
        };
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return {
          balance: 0,
        };
      }
    },
  });

  const transferButton = async () => {
    if (!account || !recipient || !transferAmount) {
      return;
    }

    try {
      const committedTransaction = await signAndSubmitTransaction(
        transferAPT({
          to: recipient,
          // APT is 8 decimal places
          amount: Math.pow(10, 8) * transferAmount,
        }),
      );

      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: `Transaction succeeded, hash: ${executedTransaction.hash}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const multiAgentButton = async () => {
    if (!account) {
      return;
    }

    try {
      const transferTxn = await aptosClient().transaction.build.multiAgent({
        sender: account.address,
        secondarySignerAddresses: [secondAccount.accountAddress],
        data: {
          function: "0x06296764fd0fdbfa96b57215efc741784b1c8e53b2dfb76487c50a1ad036e914::price_oracle::multi_message",
          functionArguments: [],
          typeArguments: [],
        },
      });

      const senderAuth = await signTransaction({
        transactionOrPayload: transferTxn,
      });

      const additionalAuth = aptosClient().transaction.sign({
        signer: secondAccount,
        transaction: transferTxn,
      });

      const committedTransaction = await aptosClient().transaction.submit.multiAgent({
        transaction: transferTxn,
        senderAuthenticator: senderAuth.authenticator,
        additionalSignersAuthenticators: [additionalAuth],
      });

      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      toast({
        title: "Success",
        description: `Multi agent Transaction succeeded, hash: ${executedTransaction.hash}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const feepayerButton = async () => {
    if (!account || !secondAccount) {
      return;
    }

    try {
      const feepayerTxn = await aptosClient().transaction.build.simple({
        sender: account.address,
        data: {
          function: "0x06296764fd0fdbfa96b57215efc741784b1c8e53b2dfb76487c50a1ad036e914::price_oracle::message",
          functionArguments: [],
          typeArguments: [],
        },
        withFeePayer: true,
      });

      const senderAuth = await signTransaction({
        transactionOrPayload: feepayerTxn,
      });

      const feepayerAuth = aptosClient().transaction.signAsFeePayer({
        signer: secondAccount,
        transaction: feepayerTxn,
      });

      const committedTransaction = await aptosClient().transaction.submit.simple({
        transaction: feepayerTxn,
        senderAuthenticator: senderAuth.authenticator,
        feePayerAuthenticator: feepayerAuth,
      });

      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: `Feepayer Transaction succeeded, hash: ${executedTransaction.hash}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (data) {
      setAptBalance(data.balance);
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-lg font-medium">Balance: {aptBalance / Math.pow(10, 8)} APT</h4>
      Recipient <Input disabled={!account} placeholder="0x1" onChange={(e) => setRecipient(e.target.value)} />
      Amount{" "}
      <Input disabled={!account} placeholder="1 APT" onChange={(e) => setTransferAmount(parseFloat(e.target.value))} />
      <Button
        disabled={!account || !recipient || !transferAmount || transferAmount > aptBalance || transferAmount <= 0}
        onClick={transferButton}
      >
        Transfer
      </Button>
      <Button disabled={!account} onClick={multiAgentButton}>
        MultiAgent Transaction
      </Button>
      <Button disabled={!account} onClick={feepayerButton}>
        FeePayer Transaction
      </Button>
    </div>
  );
}
