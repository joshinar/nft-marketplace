import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter } from 'react-router-dom';
import Navigation from './navbar';
import MarketplaceAbi from './frontend/contractsData/Marketplace.json';
import marketplaceAddress from './frontend/contractsData/Marketplace-address.json';
import NFTAbi from './frontend/contractsData/NFT.json';
import nftAddress from './frontend/contractsData/NFT-address.json';
import './App.css';
const App = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [nft, setNFT] = useState({});
  const [marketplace, setMarketplace] = useState({});
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    setAccount(accounts[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    loadContracts(signer);
  };

  const loadContracts = async (signer) => {
    const marketplace = new ethers.Contract(
      marketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    setMarketplace(marketplace);
    const nft = new ethers.Contract(nftAddress.address, NFTAbi.abi, signer);
    setNFT(nft);
    setLoading(false);
  };
  return (
    <BrowserRouter>
      <div className='App'>
        <Navigation web3Handler={web3Handler} account={account} />
      </div>
    </BrowserRouter>
  );
};

export default App;
