import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import {MoralisProvider, useMoralis} from "react-moralis"



const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

ReactDOM.render(
  
    <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
      <MoralisProvider initializeOnMount={true} appId="zjMqJRp2HMQBwduP9SbekHJFIOLh85AFj1OsX8zk" serverUrl="https://rbus7gluj43h.usemoralis.com:2053/server">
        <App />
      </MoralisProvider>
    </ThemeSwitcherProvider>
  ,
  document.getElementById("root"),
);
