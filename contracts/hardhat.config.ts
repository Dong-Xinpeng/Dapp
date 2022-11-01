import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    ganache: {
      // rpc url, change it according to your ganache configuration
      url: 'http://localhost:8545',
      // the private key of signers, change it according to your ganache user
      accounts: [
        '0x3f9e5b7dc43ea575c54819c144c2e4bf526bed935ac8687dcd998dc37d1c7dba',
        '0xd2303734e8def60ebd17c1cfd7729df37a0da72a2272a574cd2b5461977c29fe',
        '0xad3055d64123c88dec539b8604fac4ffcfff4b901c2733da573ead026a630186'
      ]
    },
  },
};

export default config;
