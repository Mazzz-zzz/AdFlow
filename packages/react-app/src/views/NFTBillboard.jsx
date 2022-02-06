// import { SyncOutlined } from "@ant-design/icons";
// import { utils } from "ethers";
import { Divider } from "antd";
import { Button, Input, List, Select, Slider, Spin, Switch, Image } from "antd";
import React, { useState, useEffect } from "react";
import { Address } from "../components";
// import { Balance } from "../components";
import {useMoralis} from "react-moralis"
import { ethers } from "ethers";


const {Option} = Select;


export default function NFTBillboard({
  localProvider,
  address,
}) {
  
  const [UserNFT, setUserNFT] = useState([])
  const [CurrentWindowData, setCurrentWindowData] = useState([])
  const [CurrentWindowOwner, setCurrentWindowOwner] = useState("");
  const [CurrentWindowContract, setCurrentWindowContract] = useState("");
  const [CurrentWindowFlowrate, setCurrentWindowFlowrate] = useState("");
  const [CurrentWindowReciever, setCurrentWindowReciever] = useState("");

  const [NFTMessage, setNFTMessage] = useState("Default message")
  const [Flowrate, setFlowrate] = useState("3858024691358");

  const tradeableCashflowJSON = require("../contracts/TradeableCashflowNEW.json");
  const tradeableCashflowABI = tradeableCashflowJSON.abi; 
  const { Moralis } = useMoralis();
  

  function GetWindows(){
      const options = { chain: 'mumbai', address: address};
      
      const polygonNFTs = Moralis.Web3API.account.getNFTs(options);
      polygonNFTs.then((res) => {
        setUserNFT(res.result);
        console.log(res.result);
        
    })
  }
  async function getWindowData(windowAddr) {
    
    
  
    
    const datacontract = new ethers.Contract(windowAddr, tradeableCashflowABI, localProvider);
    const datamessage = await datacontract.baseURI();
  
    console.log(datamessage);
    
    /*else if (datamessage == datamessage.slice(0,4) == "ipfs") {
      var xhr = new XMLHttpRequest();
      xhr.header("Access-Control-Allow-Origin", "*");
      xhr.open( 'GET', "https://ipfs.io/ipfs/" + datamessage.slice(7) , true );
      xhr.onload = function () {
        var unread = window.JSON.parse( xhr.responseText )
        console.log(unread);
        if (unread.image.slice(0,4) == "http") {
          setCurrentWindowData(<Image src={unread.image}></Image>)
        } else if (r.image.slice(0,4) == "ipfs") {
          fetch("https://ipfs.io/ipfs/" + r.image.slice(7)).then((b) => setCurrentWindowData(<Image src={b}></Image>))
        }
        
      } */ 

    

      /*fetch("https://ipfs.io/ipfs/" + datamessage.slice(7)).then((r) => {
        console.log(r.image);
        if (r.image.slice(0,4) == "http") {
          setCurrentWindowData(<Image src={datamessage}></Image>)
        } else if (r.image.slice(0,4) == "ipfs") {
          fetch("https://ipfs.io/ipfs/" + r.image.slice(7)).then((b) => setCurrentWindowData(<Image src={b}></Image>))
        }
        else setCurrentWindowData(datamessage);
      })*/

    if (datamessage == "") {
        setCurrentWindowData(<p style={{color: "red"}}>No URI set</p>);
      }
    else if (datamessage.slice(0,4) == "http") {
      setCurrentWindowData(<Image src={datamessage}></Image>)
    } else setCurrentWindowData(<p style={{overflowWrap: "break-word"}}>{datamessage}</p>);
    
    const dataowner = await datacontract.ownerOf(1);
    setCurrentWindowOwner(dataowner);

    const dataFlowrate = await datacontract.currentReceiver();
    setCurrentWindowFlowrate((((parseInt(dataFlowrate.flowRate._hex, 16 )*86400)/(10**18)).toFixed(2)));
    console.log(dataFlowrate.receiver);
    setCurrentWindowReciever(dataFlowrate.receiver.toString())
  }
  async function createflow(){
    const fDAIx = '0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f';
  
    const hostJSON = require("../contracts/superfluid/ISuperfluid.sol/ISuperfluid.json")
    const hostABI = hostJSON.abi;
  
  
    const hostAddress = '0xEB796bdb90fFA0f28255275e16936D25d3418603'
  
    const cfaJSON = require("../contracts/IConstantFlowAgreementV1.json")
    const cfaABI = cfaJSON.abi;
    const cfaAddress = '0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873';
  


    async function startFlow() {
  
  
      let ethereum = window.ethereum;
      await ethereum.enable();
      let provider = new ethers.providers.Web3Provider(ethereum);
      console.log(provider);
  
      const signer = provider.getSigner();
      var hostcontract = new ethers.Contract(hostAddress , hostABI , signer )
      //var TCFcontract = new ethers.Contract(TCF_Addr , tradeableCashflowABI , signer )
  
      const iCFA = new ethers.utils.Interface(cfaABI);
      //var CFA = new ethers.Contract(cfaAddress , cfaABI , signer );
      var CFA_TX = iCFA.encodeFunctionData("createFlow", [fDAIx, CurrentWindowContract, Flowrate, "0x"]);
      console.log("TX: ", CFA_TX)
  
      const ENCODED_URI = new ethers.utils.AbiCoder().encode(["string"], [NFTMessage]);
      
      const UNSIGNED = await hostcontract.populateTransaction.callAgreement(cfaAddress, CFA_TX, ENCODED_URI);
      
      const params = [{...UNSIGNED}];
      console.log(params)
  
      const transactionHash = await provider.send('eth_sendTransaction', params)
      console.log('transactionHash is ' + transactionHash);
    }
    
    await startFlow();
  }
  async function updateURI(){
    
  }

  return (
    <div>
      <div>
        <p>⚠️ Bug: Please get your windows manually:</p>
        <Button onClick={() => GetWindows()}>Get my windows</Button>
        <Input.Group>
          <Select defaultValue={"Select Your Owned AdWindow"} onSelect={(val) => {getWindowData(val); setCurrentWindowContract(val)}} style={{alignItems: "center", width: 400, marginTop: 20}}>
            {UserNFT.map((r, i) => (
              <Option key={r.token_address}>{r.name}</Option>
            )
            )}
          </Select>
        </Input.Group>
      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1>Manage Adwindow:</h1>
        <h2>Metadata: <b>{CurrentWindowData}</b></h2>
        <Divider />
        <div style={{ margin: 8 }}>
            <b>You are streaming: {CurrentWindowFlowrate} DAIx/day</b><br></br>
            <b>to: {CurrentWindowReciever}</b>
            
        </div>
        <Divider />
        <Input type={"number"} placeholder="FlowRate Per Day"
          onChange={e => {
            setFlowrate(Math.floor(((e.target.value)*10**18)/86400).toString())
          }}
        />
        <Input placeholder="Image URI"
          onChange={e => {
            setNFTMessage(e.target.value);
          }}
        />
        <Button onClick={() => {createflow()}}>
          CreateFlow 
        </Button>
        <Button onClick={() => {updateURI()}}>
          UpdateURI
        </Button>
                
      </div>


      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 256 }}>
      
      Adwindow Contract Address:
        <Address
          address={CurrentWindowContract}
          ensProvider={localProvider}
          fontSize={16}
        />

      </div>
    </div>
  );
}
