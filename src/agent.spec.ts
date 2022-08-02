import { FindingType, FindingSeverity, TransactionEvent, HandleTransaction, ethers, Finding } from "forta-agent";
import agent from "./agent";
import {UNISWAP_V3_FACTORY_CONTRACT_ADDRESS, SWAP_EVENT, USDC_DAI_POOL} from './constants'
import { createAddress, TestTransactionEvent } from "forta-agent-tools/lib/tests";
import { Interface } from "@ethersproject/abi";

const swapEventInterface: Interface = new Interface([SWAP_EVENT]);


describe("Testing basic functionanlity of swap detection bot", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("Uniswap swap detection bot Test Suite", () => {
    it("should not report any findings if swap does not occur", async () => {
      const mockTxFunc = new TestTransactionEvent().setFrom(UNISWAP_V3_FACTORY_CONTRACT_ADDRESS).addTraces({
        to: UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
        from: UNISWAP_V3_FACTORY_CONTRACT_ADDRESS
      });
      const findings = await handleTransaction(mockTxFunc);
      expect(findings).toStrictEqual([]);
    });

    
    it("should report findings if a swap takes place", async () => {
        const SENDER_ADDR = createAddress("0xd1");
        const REC_ADDR = createAddress("0xd1");

        const log = swapEventInterface.encodeEventLog(swapEventInterface.getEvent("Swap"), [
            SENDER_ADDR,
            REC_ADDR, 
            100,
            40,
            1,
            2,
            3
        ]);

        const mockTxEvent: TransactionEvent = new TestTransactionEvent().addAnonymousEventLog(
            USDC_DAI_POOL,
            log.data,
            ...log.topics
          );

        const findings = await handleTransaction(mockTxEvent);
        expect(findings).toStrictEqual([
            Finding.fromObject({
                "addresses": [],
                "alertId": "UNIS-1",
                "description": "A Uniswap V3 swap just took place.",
                "metadata":  {
                    "amount0": "100",
                    "amount1": "40",
                    "liquidity": "2",
                    "recipient": "0x00000000000000000000000000000000000000D1",
                    "sender": "0x00000000000000000000000000000000000000D1",
                    "sqrtPriceX96": "1",
                    "tick": "3",
                },
                "name": "Swap on Uniswap V3",
                "protocol": "Uniswap",
                "severity": FindingSeverity.Low,
                "type": FindingType.Info,
            })
        ]);
    }
    )

    it("should not throw error if a swap originated from random address", async () => {
        const SENDER_ADDR = createAddress("0xd1");
        const REC_ADDR = createAddress("0xd1");
        const RANDOM_ADDR = createAddress("0x23");

        const log = swapEventInterface.encodeEventLog(swapEventInterface.getEvent("Swap"), [
            SENDER_ADDR,REC_ADDR, 100,40,1,2,3
        ]);

        const mockTxEvent: TransactionEvent = new TestTransactionEvent().addAnonymousEventLog(
            RANDOM_ADDR, log.data, ...log.topics
          );

        const findings = await handleTransaction(mockTxEvent);
        expect(findings).toStrictEqual([]);
    }
    )

    });
});
