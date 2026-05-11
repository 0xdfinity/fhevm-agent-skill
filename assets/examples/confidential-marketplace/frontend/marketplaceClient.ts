import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import type { Contract } from "ethers";

export async function encryptMarketplaceAmount(contractAddress: string, userAddress: string, amount: bigint) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(amount);
  const encrypted = await input.encrypt();

  return {
    encryptedAmount: encrypted.handles[0],
    inputProof: encrypted.inputProof,
  };
}

export async function createPrivateListing(
  marketplace: Contract,
  marketplaceAddress: string,
  sellerAddress: string,
  metadataURI: string,
  reserve: bigint,
) {
  const encrypted = await encryptMarketplaceAmount(marketplaceAddress, sellerAddress, reserve);
  return marketplace.createListing(metadataURI, encrypted.encryptedAmount, encrypted.inputProof);
}

export async function submitPrivateOffer(
  marketplace: Contract,
  marketplaceAddress: string,
  buyerAddress: string,
  listingId: bigint,
  offer: bigint,
) {
  const encrypted = await encryptMarketplaceAmount(marketplaceAddress, buyerAddress, offer);
  return marketplace.submitOffer(listingId, encrypted.encryptedAmount, encrypted.inputProof);
}

export async function readRevealedBestOffer(marketplace: Contract, listingId: bigint) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const [offerHandle, buyerHandle] = await marketplace.bestOfferHandles(listingId);
  const result = await instance.publicDecrypt([offerHandle, buyerHandle]);

  return {
    offer: result.clearValues[offerHandle],
    buyer: result.clearValues[buyerHandle],
    proof: result.decryptionProof,
  };
}
