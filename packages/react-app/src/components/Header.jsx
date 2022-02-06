import { PageHeader, Menu } from "antd";
import React from "react";
/*{<Menu style={{margin: 10, border: "1px solid black", borderRadius: "10px"}} mode="horizontal" >
        <Menu.Item key="mail" >
          <Link to="/mint">Webmaster Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="app" disabled >
          Navigation Two
        </Menu.Item>

      </Menu>}*/

// displays a page header

export default function Header() {
  return (
    <div style={{display: "flex"}}>
    <a href="https://github.com/Mazzz-zzz/AdFlow/" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🌊 AdFlow"
        subTitle="Flexible Web3 Advertising"
        style={{ cursor: "pointer"}}
      />
    </a>
    
    </div>
  );
}
