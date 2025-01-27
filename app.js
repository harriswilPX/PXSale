// Solana Web3 setup
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
const walletAddressElement = document.getElementById('walletAddress');
const connectWalletButton = document.getElementById('connectWallet');
const buyButton = document.getElementById('buyButton');
const usdcAmountInput = document.getElementById('usdcAmount');
const messageElement = document.getElementById('message');
const tokenProgress = document.getElementById('tokenProgress');
const tokensSoldElement = document.getElementById('tokensSold');
const totalTokens = 12500000;
let wallet;

// The wallet address to receive the USDC
const recipientAddress = new solanaWeb3.PublicKey("8WsA7RjuNWYYTChTdgD9e86Ag2qz7vhvxs4c8UBoEQGn");

// Price per token in USDC
const tokenPriceInUSDC = 0.016;

// Connect Phantom wallet
connectWalletButton.addEventListener('click', async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            wallet = window.solana;
            walletAddressElement.innerText = `Connected: ${wallet.publicKey.toString()}`;
            connectWalletButton.disabled = true;
        } catch (error) {
            console.log(error);
            walletAddressElement.innerText = 'Connection Failed';
        }
    } else {
        alert("Please install Phantom Wallet");
    }
});

// Buy tokens
buyButton.addEventListener('click', async () => {
    const usdcAmount = parseFloat(usdcAmountInput.value);
    if (isNaN(usdcAmount) || usdcAmount <= 0) {
        alert("Please enter a valid amount in USDC.");
        return;
    }

    const tokensToBuy = usdcAmount / tokenPriceInUSDC;
    const usdcAmountInLamports = usdcAmount * 1e6; // Convert USDC to lamports (smallest unit of USDC)

    try {
        const transaction = new solanaWeb3.Transaction();
        const senderPublicKey = wallet.publicKey;
        const recipientPublicKey = recipientAddress;

        // Create a transfer instruction for USDC to recipient
        const transferInstruction = new solanaWeb3.SystemProgram.transfer({
            fromPubkey: senderPublicKey,
            toPubkey: recipientPublicKey,
            lamports: usdcAmountInLamports,
        });

        transaction.add(transferInstruction);

        // Send the transaction and await confirmation
        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [wallet]);

        // Update the UI with success message
        messageElement.innerText = `Success! You bought ${tokensToBuy.toFixed(2)} ParseX tokens.`;
        
        // Update the tokens sold and progress bar
        const tokensSold = Math.min(totalTokens, tokensToBuy + parseInt(tokensSoldElement.innerText));
        tokensSoldElement.innerText = tokensSold;
        tokenProgress.value = tokensSold;
    } catch (error) {
        console.log(error);
        messageElement.innerText = 'Transaction failed, please try again.';
    }
});
