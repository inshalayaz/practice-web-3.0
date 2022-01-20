import { useEffect, useState, createContext, Children } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);

  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);
  const handleChange = (e, name) => {
    // console.log(e.target.value);
    setFormData(() => ({ ...formData, [name]: e.target.value }));
    // console.log(formData);
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = getEthereumContract();

        const availableTransactions =
          await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map(
          (transaction) => ({
            addressTo: transaction.receiver,
            addressFrom: transaction.sender,
            timestamp: new Date(
              transaction.timestamp.toNumber() * 1000
            ).toLocaleString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: parseInt(transaction.amount._hex) / 10 ** 18,
          })
        );

        setTransactions(structuredTransactions);
        console.log(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = transactionContract.getTransactionCount();
      localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletConnected = async () => {
    try {
      if (!ethereum) return alert("Please Install Metamask to Continue!!!");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No Accounts found");
      }
      console.log(accounts);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum Object.");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please Install Metamask to Continue!!!");
      // Get the data from the form

      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208",
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log(`Loading -  ${transactionHash.hash} `);
      transactionHash.wait();
      setIsLoading(false);
      console.log(`Success -  ${transactionHash.hash} `);

      const transactionCount = await transactionContract.getTransactionCount();
      localStorage.setItem("transactionCount", transactionContract);

      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum Object.");
    }
  };

  useEffect(() => {
    checkIfWalletConnected();
    checkIfTransactionsExists();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please Install Metamask to Continue!!!");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccounts(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum Object.");
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
