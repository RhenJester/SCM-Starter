// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;


    uint256 public economyTicketPrice = 10;
    uint256 public businessTicketPrice = 15;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event TicketBought(string ticketType, uint256 price);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert
                InsufficientBalance({
                    balance: balance,
                    withdrawAmount: _withdrawAmount
                });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function buyTicket(string memory ticketType) public {
        uint256 ticketPrice;
         if (keccak256(abi.encodePacked(ticketType)) == keccak256(abi.encodePacked("economy"))) {
            ticketPrice = economyTicketPrice;
        } else if (keccak256(abi.encodePacked(ticketType)) == keccak256(abi.encodePacked("business"))) {
            ticketPrice = businessTicketPrice;
        } else {
            revert("Invalid ticket type");
        }

        require(balance >= ticketPrice, "Insufficient funds to buy ticket");
        balance -= ticketPrice;
        emit TicketBought(ticketType, ticketPrice);
    }
}