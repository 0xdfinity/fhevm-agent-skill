import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import type { Contract } from "ethers";

export async function encryptBid(auctionAddress: string, bidderAddress: string, bid: bigint) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const input = instance.createEncryptedInput(auctionAddress, bidderAddress);
  input.add64(bid);
  const encrypted = await input.encrypt();

  return {
    encryptedBid: encrypted.handles[0],
    inputProof: encrypted.inputProof,
  };
}

export async function submitEncryptedBid(
  auction: Contract,
  auctionAddress: string,
  bidderAddress: string,
  bid: bigint,
) {
  const encrypted = await encryptBid(auctionAddress, bidderAddress, bid);
  return auction.submitBid(encrypted.encryptedBid, encrypted.inputProof);
}

export async function readRevealedWinner(auction: Contract) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const highestBidHandle = await auction.highestBidHandle();
  const winnerHandle = await auction.winnerHandle();
  const result = await instance.publicDecrypt([highestBidHandle, winnerHandle]);

  return {
    highestBid: result.clearValues[highestBidHandle],
    winner: result.clearValues[winnerHandle],
    proof: result.decryptionProof,
  };
}
