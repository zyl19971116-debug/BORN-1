"use client";
import { create } from "zustand";
type AppState={address:string|null;votedId:number|null;voteIncrements:Record<number,number>;walletOpen:boolean;winnerOpen:boolean;connect:()=>void;disconnect:()=>void;vote:(id:number)=>void;setWalletOpen:(v:boolean)=>void;setWinnerOpen:(v:boolean)=>void};
export const useAppStore=create<AppState>((set)=>({address:null,votedId:null,voteIncrements:{},walletOpen:false,winnerOpen:false,connect:()=>set({address:"0x82A7...19FA",walletOpen:false}),disconnect:()=>set({address:null,votedId:null}),vote:(id)=>set(s=>s.votedId===null?{votedId:id,voteIncrements:{...s.voteIncrements,[id]:(s.voteIncrements[id]||0)+1}}:{}),setWalletOpen:(v)=>set({walletOpen:v}),setWinnerOpen:(v)=>set({winnerOpen:v})}));
