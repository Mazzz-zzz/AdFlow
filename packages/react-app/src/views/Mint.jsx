import { SyncOutlined } from "@ant-design/icons";
import { Signer, utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Image } from "antd";
import React, { useState } from "react";
import { Address, Balance } from "../components";
import { Transactor } from "../helpers";

import { ethers } from "ethers";
import {MoralisProvider, useMoralis} from "react-moralis"

import TCF from '../contracts/TradeableCashflow.json';



export default function Mint({
    message,
    purpose,
    setPurposeEvents,
    address,
    mainnetProvider,
    localProvider,
    yourLocalBalance,
    price,
    tx,
    readContracts,
    writeContracts,
    
  }) {
    function GetNFTS(theaddress) {
      const { Moralis, initialize, isInitialized} = useMoralis();
      const [Collection, setNewCollection] = useState([]);
      const [Userdata, setUserdata] = useState([]);
      const [NFTMessage, setNFTMessage] = useState("Default message")
      const [Flowrate, setFlowrate] = useState("3858024691358");
      console.log(Flowrate);
    
      const tradeableCashflowJSON = require("../contracts/TradeableCashflow.json");
      const tradeableCashflowABI = tradeableCashflowJSON.abi; 
      const provider = localProvider;
      var datacontract = new ethers.Contract("0x11389d15872b784f3320ed412f2c3294f4302dfd", tradeableCashflowABI, provider);
    
      function startit(){
    
          console.log(theaddress.theaddress)
          const options = { chain: 'mumbai', address: theaddress.theaddress};
          const polygonNFTs = Moralis.Web3API.account.getNFTs(options);
          polygonNFTs.then((res) => {
            console.log(res.result);
            setNewCollection(res.result);
            var newData = Userdata
            res.result.map(async (member, i) => {
    
              var data = datacontract.attach(member.token_address);
              const collectionUserData = await data.userData();
              if (collectionUserData == "") {
                newData[i] = <p style={{color: "red"}}>Not set</p>;
                setUserdata(newData)
              }
              else if (collectionUserData.slice(0,4) == "http") {
                newData[i] = <Image src={collectionUserData}></Image>
                setUserdata(newData)
              }
              else {newData[i] = collectionUserData; setUserdata(newData)}
    
              
            })
          })
      }
    
    
      return(
          <div>
              <Button onClick={() => {startit()}}>Fetch My Windows</Button>
              <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-evenly"}}>
                {Collection.map((member, index) => (
                  <div  key={index} style={{padding: "10px"}}>
                    <div style={{ border: "1px solid #cccccc", padding: 16, width: "30vw", margin: "auto", marginTop: 64 }}>
                      <h1>{member.name}:</h1>               
                      <Divider />
                      <h3>USERDATA: {Userdata[index]}</h3>
                      <div style={{ margin: 8 }}>
                        <Input placeholder="FlowRate Per Day"
                        onChange={e => {
                          setFlowrate(Math.floor(((e.target.value)*10**18)/86400).toString())
                        }}
                        />
                        <Input placeholder="Image URI"
                        onChange={e => {
                          setNFTMessage(e.target.value);
                        }}
                        />
                        <Button onClick={() => {createflow(member.token_address, theaddress.theaddress, NFTMessage, Flowrate)}}>
                          Create Flow
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )
    };

    function deploycontract(address, Name, Symbol){
      const host = '0xEB796bdb90fFA0f28255275e16936D25d3418603';
      const cfa = '0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873';
      const fDAIx = '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f';
      const owner = address;
    
        (async () => {
    
          let ethereum = window.ethereum;
          await ethereum.enable();
          let provider = new ethers.providers.Web3Provider(ethereum);

          const signer = provider.getSigner();
          console.log(signer);
          const metadata = TCF;
          const symbol = Symbol + "Window";
          const name = Symbol + " Window #" + Name;
    
          const factory = new ethers.ContractFactory(metadata.abi, metadata.bytecode, signer)
          const contract =  await factory.deploy(owner, name, symbol, host, cfa, fDAIx )
          console.log(`Deployment successful! Contract Address: ${contract.address}`)
        })()
    
    };

    async function createflow(TCF_Addr, USER_Addr, URIMessage, Flowrate ){
      const fDAIx = '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f';
    
      const hostJSON = require("../contracts/superfluid/ISuperfluid.sol/ISuperfluid.json")
      const hostABI = hostJSON.abi;
    
    
      const hostAddress = '0xEB796bdb90fFA0f28255275e16936D25d3418603'
    
      const cfaJSON = require("../contracts/IConstantFlowAgreementV1.json")
      const cfaABI = cfaJSON.abi;
      const cfaAddress = '0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873';
    
      const tradeableCashflowJSON = require("../contracts/TradeableCashflow.json");
      const tradeableCashflowABI = tradeableCashflowJSON.abi; 
    

      async function startFlow() {
    
    
        let ethereum = window.ethereum;
        await ethereum.enable();
        let provider = new ethers.providers.Web3Provider(ethereum);
        console.log(provider);
    
        const signer = provider.getSigner();
        var hostcontract = new ethers.Contract(hostAddress , hostABI , signer )
        var TCFcontract = new ethers.Contract(TCF_Addr , tradeableCashflowABI , signer )
    
        const iCFA = new ethers.utils.Interface(cfaABI);
        var CFA = new ethers.Contract(cfaAddress , cfaABI , signer );
        var CFA_TX = iCFA.encodeFunctionData("createFlow", [fDAIx, TCF_Addr, Flowrate, "0x"]);
        console.log("TX: ", CFA_TX)
    
        const ENCODED_URI = new ethers.utils.AbiCoder().encode(["string"], [URIMessage]);
        
        const UNSIGNED = await hostcontract.populateTransaction.callAgreement(cfaAddress, CFA_TX, ENCODED_URI);
        
        const params = [{...UNSIGNED}];
        console.log(params)
    
        const transactionHash = await provider.send('eth_sendTransaction', params)
        console.log('transactionHash is ' + transactionHash);
      }
    
      await startFlow();
    }



    const [Name, setNewName] = useState("ValueNotSet");
    const [Symbol, setNewSymbol] = useState("ValueNotSet");
    
  
    return (
      <div>
        {/*
          ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
        */}
        <div style={{ border: "1px solid black", boxShadow: "5px 5px" , borderRadius: "10px", padding: 16, width: "50vw", margin: "auto", marginTop: 64 }}>
          <h1>Mint New AdWindow Token</h1>
          <Input padding="2vw"
             placeholder="Board #" onChange={e => {
                setNewName(e.target.value);
              }}
            />
            <Input style={{marginTop: "1vw", marginBottom: "1vw"}}
            placeholder="Website Name" onChange={e => {
                setNewSymbol(e.target.value);
              }}
            />
          <Button onClick={async () => {deploycontract(address, Name, Symbol)}}>
            Mint new
          </Button>
        </div>
        <Divider />
          <GetNFTS theaddress={address} />


        </div>
    );
  }
  



