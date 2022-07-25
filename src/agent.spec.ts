// import {
//     FindingType,
//     FindingSeverity,
//     Finding,
//     HandleTransaction,
//     createTransactionEvent,
//     ethers,
//   } from "forta-agent";

//   import dataJson from './data.json'; 

//   import { TestTransactionEvent } from "forta-agent-tools/lib/tests";
//   import Web3 from "web3";
  
//   let web3 = new Web3();
//   let txnData =
//     web3.eth.abi.encodeFunctionSignature({
//       name: "createAgent",
//       type: "function",
//       inputs: [
//         { type: "uint256", name: "" },
//         { type: "address", name: "" },
//         { type: "string", name: "" },
//         { type: "uint256[]", name: "" },
//       ],
//     }) +
//     web3.eth.abi
//       .encodeParameters(
//         ["uint256", "address", "string", "uint256[]"],
//         [
//           "2345675643",
//           "0x56D9e2Ce76F9E97337938112230B1Ca3506A858f",
//           "Hello world",
//           ["9696", "2343"],
//         ]
//       )
//       .slice(2);
  
//   describe("Testing basic functionanlity of bot deployment detection bot", () => {
//     let handleTransaction: HandleTransaction;
//     const mockTxEvent = createTransactionEvent({} as any);
  
//     beforeAll(() => {
//       handleTransaction = agent.handleTransaction;
//     });
  
//     describe("Tests #1", () => {
//       // it("No findings if agent is not deployed", async () => {
//       //   const mockTxFunc = new TestTransactionEvent().setFrom(NETHERMIND_ADDR).setTo(FORTA_ADDR);
//       //   const findings = await handleTransaction(mockTxFunc);
//       //   expect(findings).toStrictEqual([]);
//       // });
  
//       it("Notices agent deployment", async () => {
//         const mockTxFunc = new TestTransactionEvent()
//           .setFrom(NETHERMIND_ADDR)
//           .setTo(FORTA_ADDR)
//           .setData(txnData);
//         console.log("HERR", FORTA_ADDR);
//         const findings = await handleTransaction(mockTxFunc);
//         expect(findings).toStrictEqual([
//           Finding.fromObject({
//             name: "Forta Agent Deployed",
//             description:
//               "A Forta agent was just deployed from the Nethermind deployer",
//             alertId: "FAD" + "0",
//             protocol: "Forta",
//             severity: FindingSeverity.Low,
//             type: FindingType.Info,
//             metadata: {},
//           }),
//         ]);
//       });
  
//       // it("No findings if non-nethermind deployer", async () => {
//       //   const mockTxFunc = new TestTransactionEvent().setFrom(FORTA_ADDR).setTo(FORTA_ADDR).setData(txnData);
//       //   const findings = await handleTransaction(mockTxFunc);
//       //   expect(findings).toStrictEqual([]);
//       // });
  
//       // it("No findings if non-forta deployer", async () => {
//       //   const mockTxFunc = new TestTransactionEvent().setFrom(NETHERMIND_ADDR).setTo(NETHERMIND_ADDR).setData(txnData);
//       //   const findings = await handleTransaction(mockTxFunc);
//       //   expect(findings).toStrictEqual([]);
//       // });
//     });
//   });
  