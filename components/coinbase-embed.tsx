// components/CoinbasePaymentEmbed.js
import React from 'react';

const CoinbasePaymentEmbed = ({ walletAddress }: { walletAddress: string | undefined }) => {

    if (!walletAddress) {
        return
    }
    
    const paymentUrl = `https://pay.coinbase.com/buy/select-asset?addresses=%7B%22${walletAddress}%22%3A%5B%22solana%22%5D%7D&appId=61b2f482-686d-4577-bf2b-9012509ba06f&assets=%5B%22SOL%22%2C%22ETH%22%5D&partnerUserId=partnerUserId`;

    return (
        <div style={{ position: 'relative', width: '100%', height: '500px' }}>
        <iframe
            src={paymentUrl}
            style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            }}
            title="Coinbase Payment"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin"
        ></iframe>
        </div>
    );
};

export default CoinbasePaymentEmbed;
