import { FindingType, FindingSeverity, TransactionEvent, HandleTransaction, Finding } from "forta-agent";
import { provideHandleTransaction } from "./agent";
import {
  UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
  SWAP_EVENT,
  USDC_DAI_POOL,
  UNISWAP_POOL_CONTRACT_CREAT_CODE_HASH,
} from "./constants";
import { createAddress, TestTransactionEvent } from "forta-agent-tools/lib/tests";
import { Interface } from "@ethersproject/abi";

const TRANSFER_EVENT = "event Transfer(address from, address to, uint amount)";
const swapEventInterface: Interface = new Interface([SWAP_EVENT, TRANSFER_EVENT]);

describe("Testing basic functionanlity of swap detection bot", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(
      UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
      UNISWAP_POOL_CONTRACT_CREAT_CODE_HASH
    );
  });

  it("empty transaction should not trigger an event", async () => {
    const mockTxFunc = new TestTransactionEvent();
    const findings = await handleTransaction(mockTxFunc);
    expect(findings).toStrictEqual([]);
  });

  it("should not report any findings if swap does not occur", async () => {
    const mockTxFunc = new TestTransactionEvent().setFrom(UNISWAP_V3_FACTORY_CONTRACT_ADDRESS).addTraces({
      to: UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
      from: UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
    });
    const findings = await handleTransaction(mockTxFunc);
    expect(findings).toStrictEqual([]);
  });

  it("should report findings if a swap takes place", async () => {
    const SENDER_ADDR = createAddress("0xD1");
    const REC_ADDR = createAddress("0xC1");

    const log = swapEventInterface.encodeEventLog(swapEventInterface.getEvent("Swap"), [
      SENDER_ADDR,
      REC_ADDR,
      100,
      40,
      1,
      2,
      3,
    ]);

    const mockTxEvent: TransactionEvent = new TestTransactionEvent().addAnonymousEventLog(
      USDC_DAI_POOL,
      log.data,
      ...log.topics
    );

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Swap on Uniswap V3",
        addresses: ["0x5777d92f208679db4b9778590fa3cab3ac9e2168"],
        description: "A Uniswap V3 swap just took place.",
        alertId: "UNI-1",
        protocol: "Uniswap",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          sender: SENDER_ADDR,
          recipient: REC_ADDR,
          amount0: "100",
          amount1: "40",
          sqrtPriceX96: "1",
          liquidity: "2",
          tick: "3",
        },
      }),
    ]);
  });

  it("should report more than 1 findings for mutiple swaps ", async () => {
    const SENDER_ADDR = createAddress("0xD1");
    const REC_ADDR = createAddress("0xD1");

    const log = swapEventInterface.encodeEventLog(swapEventInterface.getEvent("Swap"), [
      SENDER_ADDR,
      REC_ADDR,
      100,
      40,
      1,
      2,
      3,
    ]);

    const mockTxEvent: TransactionEvent = new TestTransactionEvent()
      .addAnonymousEventLog(USDC_DAI_POOL, log.data, ...log.topics)
      .addAnonymousEventLog(USDC_DAI_POOL, log.data, ...log.topics);

    const findings = await handleTransaction(mockTxEvent);
    const singleFinding = Finding.fromObject({
      name: "Swap on Uniswap V3",
      addresses: ["0x5777d92f208679db4b9778590fa3cab3ac9e2168"],
      description: "A Uniswap V3 swap just took place.",
      alertId: "UNI-1",
      protocol: "Uniswap",
      severity: FindingSeverity.Low,
      type: FindingType.Info,
      metadata: {
        sender: SENDER_ADDR,
        recipient: REC_ADDR,
        amount0: "100",
        amount1: "40",
        sqrtPriceX96: "1",
        liquidity: "2",
        tick: "3",
      },
    });

    expect(findings).toStrictEqual([singleFinding, singleFinding]);
  });

  it("should return 0 findings and not throw an error if swap originates from random address ", async () => {
    const SENDER_ADDR = createAddress("0xd1");
    const REC_ADDR = createAddress("0xd1");
    const RANDOM_ADDR = createAddress("0x23");

    const log = swapEventInterface.encodeEventLog(swapEventInterface.getEvent("Swap"), [
      SENDER_ADDR,
      REC_ADDR,
      100,
      40,
      1,
      2,
      3,
    ]);

    const mockTxEvent: TransactionEvent = new TestTransactionEvent().addAnonymousEventLog(
      RANDOM_ADDR,
      log.data,
      ...log.topics
    );

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });

  it("should return 0 findings if non-swap even originates from uniswapv3 pool address", async () => {
    const SENDER_ADDR = createAddress("0xD1");
    const REC_ADDR = createAddress("0xC1");

    const log = swapEventInterface.encodeEventLog(swapEventInterface.getEvent("Transfer"), [
      SENDER_ADDR,
      REC_ADDR,
      100,
    ]);

    const mockTxEvent: TransactionEvent = new TestTransactionEvent().addAnonymousEventLog(
      USDC_DAI_POOL,
      log.data,
      ...log.topics
    );

    const findings = await handleTransaction(mockTxEvent);
    expect(findings).toStrictEqual([]);
  });
});
