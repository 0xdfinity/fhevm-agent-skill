import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.16.0/+esm";

const relayerSDK = globalThis.relayerSDK;
const { initSDK, createInstance, SepoliaConfig } = relayerSDK || {};

const state = {
  deployment: undefined,
  provider: undefined,
  signer: undefined,
  account: undefined,
  contract: undefined,
  fhevm: undefined,
};

const elements = {
  contractAddress: document.querySelector("#contractAddress"),
  walletAddress: document.querySelector("#walletAddress"),
  connectWallet: document.querySelector("#connectWallet"),
  switchNetwork: document.querySelector("#switchNetwork"),
  refreshTallies: document.querySelector("#refreshTallies"),
  candidateChoice: document.querySelector("#candidateChoice"),
  castVote: document.querySelector("#castVote"),
  closeVoting: document.querySelector("#closeVoting"),
  decryptTallies: document.querySelector("#decryptTallies"),
  results: document.querySelector("#results"),
  runtimeLog: document.querySelector("#runtimeLog"),
};

function log(message) {
  const time = new Date().toLocaleTimeString();
  elements.runtimeLog.textContent = `[${time}] ${message}\n${elements.runtimeLog.textContent}`;
}

function formatError(error) {
  return error?.shortMessage || error?.reason || error?.message || String(error);
}

function shortAddress(address) {
  if (!address) return "Disconnected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function requireWallet() {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask or another EIP-1193 wallet.");
  }
}

function requireDeployment() {
  if (!state.deployment?.address || state.deployment.abi.length === 0) {
    throw new Error("Contract deployment is missing. Run npm run deploy:demo first.");
  }
}

async function loadDeployment() {
  const response = await fetch("./deployment.json", { cache: "no-store" });
  state.deployment = await response.json();
  elements.contractAddress.textContent = state.deployment.address || "Not deployed";
  elements.candidateChoice.innerHTML = "";

  for (let i = 0; i < Number(state.deployment.candidateCount || 3); i++) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `Candidate ${i + 1}`;
    elements.candidateChoice.appendChild(option);
  }

  await renderTallyHandles();
}

async function connectWallet() {
  requireWallet();
  requireDeployment();

  await window.ethereum.request({ method: "eth_requestAccounts" });
  state.provider = new ethers.BrowserProvider(window.ethereum);
  state.signer = await state.provider.getSigner();
  state.account = await state.signer.getAddress();
  state.contract = new ethers.Contract(state.deployment.address, state.deployment.abi, state.signer);

  elements.walletAddress.textContent = shortAddress(state.account);
  log(`Wallet connected: ${state.account}`);
}

async function switchToSepolia() {
  requireWallet();
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0xaa36a7" }],
  });
  log("Wallet switched to Sepolia.");
}

async function getFhevmInstance() {
  requireWallet();
  if (state.fhevm) return state.fhevm;
  if (!initSDK || !createInstance || !SepoliaConfig) {
    throw new Error("Zama Relayer SDK did not load. Check the SDK script tag and browser network console.");
  }

  log("Loading Zama Relayer SDK...");
  await initSDK();
  state.fhevm = await createInstance({ ...SepoliaConfig, network: window.ethereum });
  log("FHEVM instance ready.");
  return state.fhevm;
}

async function castEncryptedVote() {
  if (!state.contract) await connectWallet();

  const fhevm = await getFhevmInstance();
  const choice = Number(elements.candidateChoice.value);
  log(`Encrypting vote for candidate ${choice + 1}...`);

  const input = fhevm.createEncryptedInput(state.deployment.address, state.account);
  input.add8(choice);
  const encrypted = await input.encrypt();

  log("Sending encrypted vote transaction...");
  const tx = await state.contract.castVote(encrypted.handles[0], encrypted.inputProof, { gasLimit: 15_000_000n });
  log(`Transaction submitted: ${tx.hash}`);
  await tx.wait();
  log("Encrypted vote confirmed.");
  await renderTallyHandles();
}

async function closeVoting() {
  if (!state.contract) await connectWallet();
  log("Requesting final public tally reveal...");
  const tx = await state.contract.requestTallyReveal({ gasLimit: 15_000_000n });
  log(`Close transaction submitted: ${tx.hash}`);
  await tx.wait();
  log("Voting closed and tally handles marked publicly decryptable.");
}

async function renderTallyHandles() {
  elements.results.innerHTML = "";
  if (!state.deployment?.address || state.deployment.abi.length === 0) {
    elements.results.textContent = "No deployment loaded yet.";
    return;
  }

  const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : undefined;
  if (!provider) {
    elements.results.textContent = "Connect a wallet to read tally handles.";
    return;
  }

  const contract = new ethers.Contract(state.deployment.address, state.deployment.abi, provider);
  for (let i = 0; i < Number(state.deployment.candidateCount || 3); i++) {
    const row = document.createElement("div");
    row.className = "result-row";
    const label = document.createElement("div");
    label.innerHTML = `<strong>Candidate ${i + 1}</strong><br />`;
    const code = document.createElement("code");
    try {
      code.textContent = await contract.tallyHandle(i);
    } catch {
      code.textContent = "Handle unavailable";
    }
    label.appendChild(code);
    const value = document.createElement("span");
    value.className = "result-value";
    value.textContent = "-";
    row.append(label, value);
    elements.results.appendChild(row);
  }
}

async function publicDecryptTallies() {
  requireDeployment();
  const fhevm = await getFhevmInstance();
  const provider = state.provider || new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(state.deployment.address, state.deployment.abi, provider);

  log("Reading tally handles...");
  const handles = [];
  for (let i = 0; i < Number(state.deployment.candidateCount || 3); i++) {
    handles.push(await contract.tallyHandle(i));
  }

  log("Public decrypting final tallies...");
  const result = await fhevm.publicDecrypt(handles);
  const clearValues = result.clearValues || result;

  [...elements.results.querySelectorAll(".result-row")].forEach((row, index) => {
    row.querySelector(".result-value").textContent = String(clearValues[handles[index]] ?? "?");
  });
  log("Public tallies decrypted.");
}

function bindHandlers() {
  elements.connectWallet.addEventListener("click", () => connectWallet().catch((error) => log(formatError(error))));
  elements.switchNetwork.addEventListener("click", () => switchToSepolia().catch((error) => log(formatError(error))));
  elements.refreshTallies.addEventListener("click", () => renderTallyHandles().catch((error) => log(formatError(error))));
  elements.castVote.addEventListener("click", () => castEncryptedVote().catch((error) => log(formatError(error))));
  elements.closeVoting.addEventListener("click", () => closeVoting().catch((error) => log(formatError(error))));
  elements.decryptTallies.addEventListener("click", () => publicDecryptTallies().catch((error) => log(formatError(error))));
}

window.addEventListener("error", (event) => log(`Runtime error: ${event.message}`));
window.addEventListener("unhandledrejection", (event) => log(`Runtime error: ${formatError(event.reason)}`));

bindHandlers();
loadDeployment().catch((error) => log(formatError(error)));
