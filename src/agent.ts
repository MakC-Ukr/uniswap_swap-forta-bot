import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  getJsonRpcUrl,
} from "forta-agent";
var ethers = require("ethers");
import dataJson from "./data.json";
import LRU from "lru-cache";

export function provideHandleTransaction(
  SWAP_EVENT: string,
  PoolABI: any[],
  UniswapV3FactoryContractAddress: string,
  FactoryABI: any[]
): HandleTransaction {
  const cache: LRU<string, string[]> = new LRU<string, string[]>({ max: 10000 });

  let provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());
  let v3Factory = new ethers.Contract(UniswapV3FactoryContractAddress, FactoryABI, provider);

  return async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];
    const swapEvents = txEvent.filterLog(SWAP_EVENT);

    for (const swapEvent of swapEvents) {
      const poolAddress: string = swapEvent["address"];
      let [token0, token1, fee]: string[] = [];

      if (cache.has(poolAddress)) {
        let poolData: string[] = cache.get(poolAddress)!;
        token0 = poolData[0];
        token1 = poolData[1];
        fee = poolData[2];
      } else {
        let poolContract = new ethers.Contract(poolAddress, PoolABI, provider);
        [token0, token1, fee] = await Promise.all([poolContract.token0(), poolContract.token1(), poolContract.fee()]);
        let addToCache: string[] = [token0, token1, fee];
        cache.set(poolAddress, addToCache);
      }

      let temp: string = await v3Factory.getPool(token0, token1, fee);
      if (temp.toLowerCase() == poolAddress.toLowerCase()) {
        findings.push(
          Finding.fromObject({
            name: "Swap on Uniswap V3",
            description: `A Uniswap V3 swap just took place.`,
            alertId: "UNIS-1",
            protocol:"Uniswap",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              "network":txEvent.network.toString()
            },
          })
        );
      }
    }

    return findings;
  };
}

export default {
  handleTransaction: provideHandleTransaction(
    dataJson.SWAP_EVENT,
    dataJson.PoolABI,
    dataJson.UniswapV3FactoryContractAddress,
    dataJson.FactoryABI
  ),
};
