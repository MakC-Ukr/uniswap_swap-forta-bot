# Uniswap swaps Forta agent

## Description

This agent detects any swaps made with Uniswap V3. It only detects swaps done by Pools deployed by Uniswap v3 Factory Contract (0x1F98431c8aD98523631AE4a59f267346ea31F984).

## Supported Chains

- Ethereum Mainnet (chainId: 1)

## Alerts

Describe each of the type of alerts fired by this agent

- UNIS-1
  - Fired when a swap occurs on Uniswap V3 
  - Severity is always set to "low" (mention any conditions where it could be something else)
  - Type is always set to "info" (mention any conditions where it could be something else)

## Test Data

The agent behaviour can be verified with the following transactions:

- [0xf46f0eb9502b9f361c6b24c4f56f7ecb93fcc90c9805ccb427942cea47d8cf18](https://etherscan.io/tx/0xf46f0eb9502b9f361c6b24c4f56f7ecb93fcc90c9805ccb427942cea47d8cf18) (Swap 127,978 USDC For 84.46 Ether On Uniswap **V3**) - should return `1 finding`
- [0x020f12508ee869fc5eb7306eea45b7865ec2ea66bd9e0f9176ee0e305ac3bc43](https://etherscan.io/tx/0x020f12508ee869fc5eb7306eea45b7865ec2ea66bd9e0f9176ee0e305ac3bc43) (Swap 0.24 Ether For 1,025 LOOKS On Uniswap **V3**) - should return `1 finding`
- [0x03f883f63841b3498fe83ac6f47b0e1ef5b4608fecae0ab4f9471da5e0d0b033](https://etherscan.io/tx/0x03f883f63841b3498fe83ac6f47b0e1ef5b4608fecae0ab4f9471da5e0d0b033) (Swap 5,736 USDC For 176,197 TSUKA On Uniswap **V2**) - should return `0 findings`