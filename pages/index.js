import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [selectedTicket, setSelectedTicket] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(1);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({
      method: "eth_requestAccounts",
    });
    handleAccount(accounts[0]);

    // Once the wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = useCallback(() => {
    if (ethWallet) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const atmContract = new ethers.Contract(
        contractAddress,
        atmABI,
        signer
      );

      setATM(atmContract);
    }
  }, [ethWallet]);

  const getBalance = async () => {
    if (atm) {
      try {
        const currentBalance = await atm.getBalance();
        console.log("Current Balance:", currentBalance.toNumber());
        setBalance(currentBalance.toNumber());
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const deposit = async (amount) => {
    if (atm) {
      try {
        let tx = await atm.deposit(amount);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error in deposit transaction:", error.message);
        alert(`Failed to deposit: ${error.message}`);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(withdrawalAmount);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error in withdraw transaction:", error.message);
        alert(`Failed to withdraw: ${error.message}`);
      }
    }
  };

  const buyTicket = useCallback(async () => {
    if (atm && selectedTicket) {
      try {
        let tx = await atm.buyTicket(selectedTicket);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error in buyTicket transaction:", error.message);
        alert(`Failed to buy ticket: ${error.message}`);
      }
    }
  }, [atm, selectedTicket]);

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this Plane.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <h2><i>Elevating Journeys, Crafting Memories</i></h2><br />
        <h3>Economy - 5 ETH</h3>
        <h3>Business - 10 ETH</h3><br />
        <p>Your Account Address: {account}</p>
        <p>Your Current Balance: {balance} ETH</p><br />
        <div>
          <label>Select Ticket Type:</label>
          <select
            value={selectedTicket}
            onChange={(e) => setSelectedTicket(e.target.value)}
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
          </select>   <button onClick={buyTicket}>Buy</button>
        </div><br />
    
        <div>
          <label>Deposit Amount (ETH):</label>  
          <input
            type="number"
            min="0"
            step="0.1"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />        <button onClick={() => deposit(depositAmount)}>Deposit</button>
        </div>
        <div>
          <label>Withdrawal Amount (ETH):</label>
          <input
            type="number"
            min="1"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
          />
          <button onClick={withdraw}>Withdraw</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    getATMContract();
  }, [getATMContract]);

  return (
    <main className="container">
      <header>
      <img
          src="https://static.vecteezy.com/system/resources/thumbnails/017/164/521/small/commercial-jet-plane-airliner-flying-png.png"
          alt="Metacrafters Image"
          style={{ width: "50%", display: "block", margin: "0 auto" }}
        />
        <h1>Welcome to the Wathay Airlines!</h1>
      </header>
      {initUser()}
      <style jsx>{`
  .container {
    text-align: center;
    margin: 50px;
    padding: 30px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: black;
    margin: auto;
    font-family: 'Calibri', sans-serif;
    color: white;
  }

  header {
    margin-bottom: 20px;
  }

  h1 {
    color: white;
  }

  label {
    display: block;
    margin-bottom: 10px;
  }

  select,
  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  button {
    background-color: #4caf50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin: 5px;
  }

  button:hover {
    background-color: #45a049;
  }

  p {
    color: #333;
    font-weight: bold;
    margin-bottom: 10px;
  }
`}</style>

    </main>
  );
}