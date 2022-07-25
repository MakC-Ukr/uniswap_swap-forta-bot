import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

const SWAP_EVENT = "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";
const UniswapV3FactoryContractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];
  const swapEvents = txEvent.filterLog(
    SWAP_EVENT
  );  
  swapEvents.forEach((swapEvent) => {
    const poolAddress = swapEvent['address'];
    const { sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick } = swapEvent.args;
    // console.log({sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick});
    // console.log({sender, recipient});

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
  });

  return findings;
};


export default {
  handleTransaction,
};
