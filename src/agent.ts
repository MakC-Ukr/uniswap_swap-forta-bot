import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getJsonRpcUrl
} from "forta-agent";
var ethers = require('ethers');
import dataJson from './data.json'; 



let provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());

let v3Factory = new ethers.Contract(dataJson.UniswapV3FactoryContractAddress, dataJson.FactoryABI, provider);


const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];
  const swapEvents = txEvent.filterLog(
    dataJson.SWAP_EVENT
  );  

  for (const swapEvent of swapEvents) {
    const poolAddress : string = swapEvent['address'];
    let poolContract = new ethers.Contract(poolAddress, dataJson.PoolABI, provider);
    let token0 = await poolContract.token0();
    let token1 = await poolContract.token1();
    let fee = await poolContract.fee();
    let temp: string =  await v3Factory.getPool(token0, token1, fee);

    if(temp.toLowerCase() == poolAddress.toLowerCase()){
      findings.push(
        Finding.fromObject({
          name: "Swap on Uniswap V3",
          description: `A Uniswap V3 swapjust took place.`,
          alertId: "UNIS-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {},
        })
      );
    }
  };

  return findings;
};


export default {
  handleTransaction,
};






