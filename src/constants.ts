const SWAP_EVENT =
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";
const UNISWAP_V3_FACTORY_CONTRACT_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const POOL_ABI = [
  "function fee() public view returns (uint24)",
  "function token0() public view returns (address)",
  "function token1() public view returns (address)",
];
const USDC_DAI_POOL = "0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168";
const UNISWAP_POOL_CONTRACT_CREAT_CODE_HASH = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";
export {
  SWAP_EVENT,
  UNISWAP_V3_FACTORY_CONTRACT_ADDRESS,
  POOL_ABI,
  UNISWAP_POOL_CONTRACT_CREAT_CODE_HASH,
  USDC_DAI_POOL,
};
