const { expect } = require('chai');

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe('NFTMarketplace', async () => {
  let deployer, addr1, addr2, nft, marketplace;
  let feePercent = 10;
  let URI = 'Sample URI';
  beforeEach(async () => {
    const NFT = await ethers.getContractFactory('NFT');
    const Marketplace = await ethers.getContractFactory('Marketplace');
    // get signers
    [deployer, addr1, addr2] = await ethers.getSigners();
    // deploy contracts
    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  });

  describe('Deployment', async () => {
    it('Should track name and symbol of NFT collection', async () => {
      expect(await nft.name()).to.equal('Helios NFT');
      expect(await nft.symbol()).to.equal('Helios');
    });
    it('Should track feeAccount and FeePercent of Marketplace collection', async () => {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });
  });

  describe("Minting NFT's", async () => {
    it('Should track each minted nft', async () => {
      await nft.connect(addr1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URI);
      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URI);
    });
  });

  describe('Making marketplace items', async () => {
    beforeEach(async () => {
      await nft.connect(addr1).mint(URI);
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
    });
    it('Should track newly created Item, transfer NFT from seller to marketplace and emit event offered', async () => {
      expect(
        await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1))
      )
        .to.emit(marketplace, 'offered')
        .withArgs(1, nft.address, 1, toWei(1), addr1.address);
      // owner of nft should be marketplace
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
    });
  });
});
