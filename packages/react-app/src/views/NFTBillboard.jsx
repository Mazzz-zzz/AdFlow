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
  message,
  billboardOwner,
  localProvider,
  readContracts,
  address,
}) {
  const [UserNFT, setUserNFT] = useState([])
  const [CurrentWindowData, setCurrentWindowData] = useState([])
  const [CurrentWindowOwner, setCurrentWindowOwner] = useState("");
  const [CurrentWindowContract, setCurrentWindowContract] = useState("");
  const [CurrentWindowFlowrate, setCurrentWindowFlowrate] = useState("");
  const [CurrentWindowReciever, setCurrentWindowReciever] = useState("");

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

    const tradeableCashflowJSON = require("../contracts/TradeableCashflowNEW.json");
    const tradeableCashflowABI = tradeableCashflowJSON.abi; 
    const datacontract = new ethers.Contract(windowAddr, tradeableCashflowABI, localProvider);
    const datamessage = await datacontract.baseURI();
  
    console.log(datamessage.slice(7));
    if (datamessage == "") {
      setCurrentWindowData(<p style={{color: "red"}}>No URI set</p>);
    }
    else if (datamessage == datamessage.slice(0,4) == "ipfs") {
      fetch("https://ipfs.io/ipfs/" + datamessage.slice(7)).then((r) => {
        console.log(r.image);
        if (r.image.slice(0,4) == "http") {
          setCurrentWindowData(<Image src={datamessage}></Image>)
        } else if (r.image.slice(0,4) == "ipfs") {
          fetch("https://ipfs.io/ipfs/" + r.image.slice(7)).then((b) => setCurrentWindowData(<Image src={b}></Image>))
        }
        else setCurrentWindowData(datamessage);
      })

    }
    else if (datamessage.slice(0,4) == "http") {
      setCurrentWindowData(<Image src={datamessage}></Image>)
    } else setCurrentWindowData(datamessage);
    
    const dataowner = await datacontract.ownerOf(1);
    setCurrentWindowOwner(dataowner);

    const dataFlowrate = await datacontract.currentReceiver();
    setCurrentWindowFlowrate((((parseInt(dataFlowrate.flowRate._hex, 16 )*86400)/(10**18)).toFixed(2)));
    console.log(dataFlowrate.receiver);
    setCurrentWindowReciever(dataFlowrate.receiver.toString())
  }
  

  return (
    <div>
      <div>
        <p>⚠️ Bug: Please get your windows manually:</p>
        <Button onClick={() => GetWindows()}>Get my windows</Button>
        <Input.Group>
          <Select onSelect={(val) => {getWindowData(val); setCurrentWindowContract(val)}} style={{alignItems: "center", width: 400, marginTop: 20}}>
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
        <Button >
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
