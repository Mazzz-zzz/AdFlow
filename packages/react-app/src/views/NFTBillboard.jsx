// import { SyncOutlined } from "@ant-design/icons";
// import { utils } from "ethers";
import { Divider } from "antd";
import { Button, Input, List, Select, Slider, Spin, Switch } from "antd";
// import React, { useState } from "react";
import { Address } from "../components";
// import { Balance } from "../components";
import {MoralisProvider, useMoralis} from "react-moralis"
const {Option} = Select;

export default function NFTBillboard({
  message,
  billboardOwner,
  mainnetProvider,
  readContracts,
}) {
  
  function GetWindows(){
    return(
      <Input.Group>
        <Select onSelect={(val) => console.log(val)} style={{alignItems: "center", width: 400, marginTop: 20}}>
          <Option key={"test"}>Contract1</Option>
          <Option key={"yo"}>Contract2</Option>
        </Select>
      </Input.Group>
    )
  }

  return (
    <div>
      <div>
      <MoralisProvider initializeOnMount={true} appId="zjMqJRp2HMQBwduP9SbekHJFIOLh85AFj1OsX8zk" serverUrl="https://rbus7gluj43h.usemoralis.com:2053/server">
        <GetWindows></GetWindows>
      </MoralisProvider>
        
      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1>NFT Billboard</h1>
        <h2>Message: <b>{message}</b></h2>
        <Divider />
        <div style={{ margin: 8 }}>
            <h3>Owner:</h3>
            <h4>
                <Address address={billboardOwner} />
            </h4>
        </div>
                
      </div>


      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 256 }}>
      
      Billboard Contract Address:
        <Address
          address={readContracts && readContracts.TradeableCashflow ? readContracts.TradeableCashflow.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />

      </div>
    </div>
  );
}
