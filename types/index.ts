export type MemeStatus = "UPCOMING" | "LIVE" | "BORN";
export type Meme = { id:number; name:string; ticker:string; emoji:string; image:string; imagePosition?:string; description:string; votes:number; status:MemeStatus; color:string; bornAgo?:string; price?:string; marketCap?:string; volume?:string; change?:number; holders?:number; address?:string };
