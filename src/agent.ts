import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  ethers,
  getJsonRpcUrl,
} from "forta-agent";
import {
  SWAP_EVENT,
  UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
  UNISWAP_POOL_CONTRACT_CREAT_CODE_HASH,
  POOL_ABI,
} from "./constants";
import LRU from "lru-cache";

const cache: LRU<string, string[]> = new LRU<string, string[]>({ max: 10000 });

function getPoolAddress(token0: string, token1: string, fee: string, deployerAddress: string, createCodeHash: string) {
  let abiCoder = new ethers.utils.AbiCoder();
  let salt: string = ethers.utils.keccak256(abiCoder.encode(["address", "address", "uint24"], [token0, token1, fee]));
  let poolAddr: string = ethers.utils.getCreate2Address(deployerAddress, salt, createCodeHash);
  return poolAddr;
}

export function provideHandleTransaction(
  uniswapFactoryAddr: string,
  uniswapPoolCreateCodeHash: string
): HandleTransaction {
  let provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());
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
        let poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
        try {
          [token0, token1, fee] = await Promise.all([poolContract.token0(), poolContract.token1(), poolContract.fee()]);
          let addToCache: string[] = [token0, token1, fee];
          cache.set(poolAddress, addToCache);
        } catch (err) {
          return findings;
        }
      }

      let temp: string = getPoolAddress(token0, token1, fee, uniswapFactoryAddr, uniswapPoolCreateCodeHash);
      if (temp.toLowerCase() === poolAddress.toLowerCase()) {
        findings.push(
          Finding.fromObject({
            name: "Swap on Uniswap V3",
            addresses: [poolAddress],
            description: `A Uniswap V3 swap just took place.`,
            alertId: "UNI-1",
            protocol: "Uniswap",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              sender: swapEvent.args.sender,
              recipient: swapEvent.args.recipient,
              amount0: swapEvent.args.amount0.toString(),
              amount1: swapEvent.args.amount1.toString(),
              sqrtPriceX96: swapEvent.args.sqrtPriceX96.toString(),
              liquidity: swapEvent.args.liquidity.toString(),
              tick: swapEvent.args.tick.toString(),
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
    UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
    UNISWAP_POOL_CONTRACT_CREAT_CODE_HASH
  ),
};
