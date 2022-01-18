// HTTP KEY

// https://eth-ropsten.alchemyapi.io/v2/QlF6tD4nUkaDQxq2WybiAsV_aWYQsaxp

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/QlF6tD4nUkaDQxq2WybiAsV_aWYQsaxp",
      accounts: [
        "b1fd8201ad2695daec5e88d3ed9c6d0cc7cad2e05520211525485e23f4f379f2",
      ],
    },
  },
};
