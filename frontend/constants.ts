import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

export const NETWORK = import.meta.env.VITE_APP_NETWORK ?? "testnet";
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS;
export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;
export const FEE_PAYER_KEY = import.meta.env.VITE_APTOS_FEE_PAYER_KEY;
export const aptos = new Aptos(new AptosConfig({ network: NETWORK }));