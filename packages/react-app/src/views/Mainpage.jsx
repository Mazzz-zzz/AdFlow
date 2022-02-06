import { utils } from "ethers";
import { Select, Button, Menu } from "antd";
import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useState } from "react";
import { Address, AddressInput } from "../components";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";



export default function Mainpage({ }) {

  return (

      <div style={{backgroundImage: "linear-gradient(45deg, white, rgba(233, 207, 255, 0.54), rgba(170, 213, 255, 0.54), white", width: 400,  margin: "auto", marginTop: 40,  borderRadius: 0, padding: 50, width: "50vw", boxShadow: "0px 0px 40px 0px"}}>
        <h1>Adflow</h1>
        <p>
          Connects webmasters with advertisers via streamable tokens
        </p>
        
        <div style={{padding: 20}}>
          <Button style={{margin: 10}}><Link to="/mint">Webmaster Dashboard</Link></Button>
          <Button style={{margin: 10}}><Link to="/billboard">Advertiser Dashboard</Link></Button>
        </div>
      </div>

  );
}
