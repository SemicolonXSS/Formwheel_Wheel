(function(root){
function validWeight(value){const n=Number(value);return Number.isFinite(n)&&n>=1?Math.min(1000000,n):1}
  function computeSlices(list) {
    const total = list.reduce((s, e) => s + validWeight(e.weight), 0) || 1;
    let acc = 0;
    return list.map((e) => {
      const w = validWeight(e.weight);
      const sliceAngle = (w / total) * 360;
      const start = acc;
      const end = acc + sliceAngle;
      acc = end;
      return { entry: e, start, end, mid: (start + end) / 2, sliceAngle };
    });
  }

  function pickWeightedIndex(list,excludeMode=false,random=Math.random){
    const candidates=list.map((e,index)=>({index,weight:validWeight(e.weight),excluded:e.excluded})).filter(e=>!excludeMode||!e.excluded);
    if(!candidates.length)return -1;
    const total=candidates.reduce((sum,e)=>sum+Math.max(1,e.weight),0),roll=Math.max(0,Math.min(1-Number.EPSILON,random()))*total;
    let acc=0;for(const e of candidates){acc+=Math.max(1,e.weight);if(roll<acc)return e.index;}return candidates.at(-1).index;
  }
root.FormwheelWeighted={computeSlices,pickWeightedIndex};
})(typeof window==='undefined'?globalThis:window);
