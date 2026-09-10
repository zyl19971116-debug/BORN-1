"use client";
import { create } from "zustand";
type AppState={address:string|null;votedId:number|null;walletOpen:boolean;winnerOpen:boolean;connect:()=>void;disconnect:()=>void;vote:(id:number)=>void;setWalletOpen:(v:boolean)=>void;setWinnerOpen:(v:boolean)=>void};
export const useAppStore=create<AppState>((set)=>({address:null,votedId:null,walletOpen:false,winnerOpen:false,connect:()=>set({address:"0x82A7...19FA",walletOpen:false}),disconnect:()=>set({address:null,votedId:null}),vote:(id)=>set({votedId:id}),setWalletOpen:(v)=>set({walletOpen:v}),setWinnerOpen:(v)=>set({winnerOpen:v})}));
