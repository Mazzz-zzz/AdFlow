//require("dotenv");
const Web3 = require("web3");

//all addresses hardcoded for mumbai
const hostJSON = require("../contracts/superfluid/ISuperfluid.sol/ISuperfluid.json")
const hostABI = hostJSON.abi;
const hostAddress = "0xEB796bdb90fFA0f28255275e16936D25d3418603";

const cfaJSON = require("../contracts/IConstantFlowAgreementV1.json")
const cfaABI = cfaJSON.abi;
const cfaAddress = "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873";

const tradeableCashflowJSON = require("../contracts/TradeableCashflow.json");
const tradeableCashflowABI = tradeableCashflowJSON.abi; 

  //temporarily hardcode contract address and sender address
const deployedTradeableCashflow = require("../contracts/polytest/TradeableCashflow.json");
const tradeableCashflowAddress = deployedTradeableCashflow.address;

//your address here
const _sender = "0x4B39D511e3Cb3F9e39A4e62fFcd959BaCffaDd3c";


//update a flow
export default async function updateit() {

  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.MUMBAI_ALCHEMY_URL));


  //create contract instances for each of these
  const host = new web3.eth.Contract(hostABI, hostAddress);
  const cfa = new web3.eth.Contract(cfaABI, cfaAddress);
  const tradeableCashflow = new web3.eth.Contract(tradeableCashflowABI, tradeableCashflowAddress);

  const fDAIx = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
  const userData = web3.eth.abi.encodeParameter('string', 'HODL ETH BRRR');


  const nonce = await web3.eth.getTransactionCount(_sender, 'latest'); // nonce starts counting from 0

  //create flow by calling host directly in this function
  //create flow from sender to tradeable cashflow address
  //pass in userData to the flow as a parameter
  async function updateFlow() {
      let cfaTx = (await cfa.methods
     .updateFlow(
      fDAIx,
      // _sender,
      tradeableCashflowAddress,
      "6858024691358",
      "0x"
     )
     .encodeABI())

     let txData = (await host.methods.callAgreement(
      cfaAddress, 
      cfaTx, 
      userData
    ).encodeABI());

    let tx = {
      'to': hostAddress,
      'gas': 3000000,
      'nonce': nonce,
      'data': txData
    }

    let signedTx = await web3.eth.accounts.signTransaction(tx, process.env.MUMBAI_DEPLOYER_PRIV_KEY);

    await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
      if (!error) {
        console.log("🎉 The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
      } else {
        console.log("❗Something went wrong while submitting your transaction:", error)
      }
     });

    }

  await updateFlow();

  }

