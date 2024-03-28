/* eslint-disable prettier/prettier */

import { mnemonicToSeedSync } from "bip39";
import HDkey from "hdkey";
import { ethers } from "ethers";
import { phrase } from '../key/index.mjs';



const rpc = "https://bsc-testnet.public.blastapi.io"




/// This function takes the chain id of the blockchain 
/// and the address of the user whose balance is being fetched.
/// it returns the balance in a string format
export async function getBalance(address){

        try{
            const provider = new ethers.JsonRpcProvider(rpc);
            const balance_in_wei = await provider.getBalance(address);
            const balance = ethers.formatEther(balance_in_wei.toString());
            return (balance).toString()
        } catch (error) {
            return null
        }
    }



export function binance(mnemonic){
        try{
            const seed = mnemonicToSeedSync(mnemonic);
            const hdKey = HDkey.fromMasterSeed(Buffer.from(seed, "hex"));
            const path = "m/44'/60'/0'/0/0"
            const child = hdKey.derive(path);
            const address = new ethers.Wallet(`0x${child.privateKey.toString("hex")}`).address
            const info = {
                address,
                path,                                   
                privateKey: `0x${child.privateKey.toString("hex")}`, // Private key in hexadecimal
            };  
            return info
        } catch(error) {
            return null
            }   
    }

    
export async function sendTransactionBNB(amount,toAddress){
    try{
        const {privateKey} = binance(phrase);
        const provider = new ethers.JsonRpcProvider(rpc);
        // Create a wallet from the private key
        const wallet = new ethers.Wallet(privateKey, provider);
        //const wallet = new ethers.Wallet.fromPhrase(privateKey);

        // Validate the toAddress
        if (!ethers.isAddress(toAddress)) {
            throw new Error('Invalid Ethereum address');
        }

        // Convert amount to Wei (1 Ether = 1e18 Wei)
        const amountWei = ethers.parseEther(amount.toString());

        // Create a transaction
        const transaction = {
            to: toAddress,
            value: amountWei,
        };

        // Send the transaction
        const tx = await wallet.sendTransaction(transaction);
        // Wait for the transaction to be mined
        await tx.wait();

        console.log(`Successfully transferred ${amount} Ether to ${toAddress}`);
        return tx;
    }
    catch(error){
        console.log(error)
        return error
    }

}





// batch transactions while charging a fee
export async function sendErcTokens(privateKey, contractTokenAddress, amount, recipient){
    try{
        const provider = new ethers.JsonRpcProvider(rpc);
        // Create a wallet from the private key
        const wallet = new ethers.Wallet(privateKey, provider);
        // Connect to the ERC-20 contract
        const erc20Contract = new ethers.Contract(contractTokenAddress, abi, wallet);
        const balance = await erc20Contract.balanceOf(wallet.address);
        if (balance < amount) {
            console.log('Insufficient balance');
            throw new Error('Insufficient balance');
        }
        // Send the ERC-20 tokens to the recipient
        const tx = await erc20Contract.transfer(recipient, amount);
        await tx.wait();
        console.log(`Sent ${amount} tokens to ${recipient}`);
        return tx.hash;
    } catch (error) {
        return null;
    }
};
    

export async function getErcTokensBalance(contractTokenAddress, address){
    try{
        const provider = new ethers.JsonRpcProvider(chains[60].rpc);
        // Connect to the ERC-20 contract
        const erc20Contract = new ethers.Contract(contractTokenAddress, abi, provider);
        const balance = await erc20Contract.balanceOf(address);
        return balance.toString()
    } catch (error) {
        return null;
    }
  };
    


export default  {
    getBalance,
    sendTransactionBNB,
    sendErcTokens,
    getErcTokensBalance,
    binance, 
};













