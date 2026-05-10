import { useCallback, useMemo, useState } from "react";
import { useEncrypt, useUserDecrypt } from "@zama-fhe/react-sdk";
import { bytesToHex, type Address, type Abi } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

type UseConfidentialUint64Args = {
  contractAddress: Address;
  abi: Abi;
  handleFunctionName: string;
  writeFunctionName: string;
};

export function useConfidentialUint64({
  contractAddress,
  abi,
  handleFunctionName,
  writeFunctionName,
}: UseConfidentialUint64Args) {
  const { address } = useAccount();
  const encrypt = useEncrypt();
  const { writeContractAsync } = useWriteContract();
  const [decryptEnabled, setDecryptEnabled] = useState(false);

  const handleRead = useReadContract({
    address: contractAddress,
    abi,
    functionName: handleFunctionName,
    query: { enabled: Boolean(address) },
  });

  const handle = handleRead.data as `0x${string}` | undefined;
  const handles = useMemo(() => (handle ? [{ handle, contractAddress }] : []), [contractAddress, handle]);
  const decrypt = useUserDecrypt({ handles }, { enabled: decryptEnabled && handles.length > 0 });

  const writeEncrypted = useCallback(
    async (value: bigint) => {
      if (!address) throw new Error("Wallet not connected");

      const encrypted = await encrypt.mutateAsync({
        values: [{ value, type: "euint64" }],
        contractAddress,
        userAddress: address,
      });

      return writeContractAsync({
        address: contractAddress,
        abi,
        functionName: writeFunctionName,
        args: [bytesToHex(encrypted.handles[0]!), bytesToHex(encrypted.inputProof)],
        gas: 15_000_000n,
      });
    },
    [abi, address, contractAddress, encrypt, writeContractAsync, writeFunctionName],
  );

  return {
    handle,
    clearValue: handle && decrypt.data ? decrypt.data[handle] : undefined,
    decrypt: () => setDecryptEnabled(true),
    isDecrypting: decrypt.isFetching,
    refetchHandle: handleRead.refetch,
    writeEncrypted,
  };
}
