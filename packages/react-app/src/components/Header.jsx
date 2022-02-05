import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/Mazzz-zzz/AdFlow/" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🌊 AdFlow"
        subTitle="Flexible Web3 Advertising"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
