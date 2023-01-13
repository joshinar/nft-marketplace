// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract Marketplace is ReentrancyGuard{
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;
    struct Item{
        uint itemId;
        IERC721 nft; 
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    event Offered(uint itemId, address indexed nft, uint tokenId, uint price, address indexed seller);
    event Bought(uint itemId, address indexed nft, uint tokenId, uint price, address indexed seller,address indexed buyer);
    mapping(uint=>Item) public Items;
    constructor(uint _feePercent){
        feeAccount=payable(msg.sender);
        feePercent=_feePercent;
    }

    function makeItem(IERC721 _nft, uint _tokenId, uint _price)external nonReentrant{
        require(_price>0,"Item price has to be greater than zero");
        itemCount++;
      _nft.transferFrom(msg.sender, address(this), _tokenId);
      Items[itemCount]=Item(itemCount, _nft,_tokenId,_price,payable(msg.sender),false);
      emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = Items[_itemId];
        require(_itemId>0&&_itemId<=itemCount,"Item doesn't exist");
        require(msg.value>=_totalPrice,"Not enough ether to cover the transaction cost");
        require(!item.sold,"Item already sold");
        // pay seller fee and feeacount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice-item.price);
        item.sold=true;
        item.nft.transferFrom(item.seller, msg.sender, item.tokenId);
        emit Bought(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
    }

    function getTotalPrice(uint _itemId)view public returns(uint){
        return (100+feePercent/100)*Items[_itemId].price;
    }
}   