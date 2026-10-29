// Extracted Mulberry32 and spatial hash; each system owns a stream.
export function createRandom(initial=48271){
 let seed=initial|0;
 const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 return {random,rr:(a,b)=>a+random()*(b-a),pick:a=>a[Math.floor(random()*a.length)]};
}
export function roomRandomScore(value){let h=2166136261;for(let i=0;i<value.length;i++)h=Math.imul(h^value.charCodeAt(i),16777619);h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);h^=h>>>16;return(h>>>0)/4294967296;}
