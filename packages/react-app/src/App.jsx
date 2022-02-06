

import { Alert, Button, Col, Menu, Row } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState} from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account,  Header, ThemeSwitch } from "./components";
import { NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";

import NFTBillboard from "./views/NFTBillboard";
import Mint from "./views/Mint";
import Mainpage from "./views/Mainpage"
//import { ExampleUI, Hints,  } from "./views";
import { useContractConfig } from "./hooks";
import {useMoralis} from "react-moralis"



const { ethers } = require("ethers");
const targetNetwork = NETWORKS.mumbai;



const DEBUG = false;
const NETWORKCHECK = true;

const localProviderUrl = targetNetwork.rpcUrl;
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrl);
const blockExplorer = targetNetwork.blockExplorer;




const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
});




function App() {
  const mainnetProvider = localProvider;
  const { Moralis, initialize, isInitialized} = useMoralis();

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };


  const gasPrice = useGasPrice(targetNetwork, "fast");
  
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
        
      } 
    }
    getAddress();
  }, [userSigner]);


  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;


  const tx = Transactor(userSigner, gasPrice);


  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:


  const contractConfig = useContractConfig();

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);


  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);


  //two new variables that we'll use
  const message = useContractReader(readContracts, "TradeableCashflow", "userData")
  const billboardOwner = useContractReader(readContracts, "TradeableCashflow", "_receiver")

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts, "YourContract", "purpose");

  // 📟 Listen for broadcast events
  const setPurposeEvents = useEventListener(readContracts, "YourContract", "SetPurpose", localProvider, 1);


  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      readContracts &&
      writeContracts &&
      mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("📝 readContuseContractLoracts", readContracts);
      console.log("🌍 DAI contract on mainnet:", mainnetContracts);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    readContracts,
    writeContracts,
    mainnetContracts,
  ]);

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;
                    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: data[0].chainId }],
                      });
                    } catch (switchError) {
                      // not checking specific error code, because maybe we're not using MetaMask
                      try {
                        switchTx = await ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: data,
                        });
                      } catch (addError) {
                        // handle "add" error
                      }
                    }

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center"}} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
          </Menu.Item>
          <Menu.Item key="/nftbillboard">
            <Link
              onClick={() => {
                setRoute("/nftbillboard");
              }}
              to="/nftbillboard"
            > 
              NFT Billboard
            </Link>
          </Menu.Item>

          <Menu.Item key="/hints">
            <Link
              onClick={() => {
                setRoute("/hints");
              }}
              to="/hints"
            > 
               Hints
            </Link>
            </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            <Mainpage

              />
            </Route>
          <Route exact path="/billboard">
            <NFTBillboard
                address={address}
                userSigner={userSigner}
                localProvider={localProvider}
                yourLocalBalance={yourLocalBalance}
                price={gasPrice}
                tx={tx}
                writeContracts={writeContracts}
                readContracts={readContracts}
                billboardOwner={billboardOwner}
                message={message}
                purpose={purpose}
                setPurposeEvents={setPurposeEvents}
              />
            </Route>

            <Route exact path="/mint">
              <Mint
                localProvider={localProvider}
                address={address}
              />
            </Route>


                   
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          price={gasPrice}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>
    </div>
  );
}

export default App;
