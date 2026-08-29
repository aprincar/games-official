(()=>{
  let port=null, readyResolve;
  const pending=new Map();
  const connected=new Promise(r=>readyResolve=r);
  const demoEvents=[];
  function emitDemo(type,payload){demoEvents.push({type,payload,at:Date.now()});window.dispatchEvent(new CustomEvent('aprincar-demo-event',{detail:{type,payload}}));}
  addEventListener('message',event=>{
    if(event.data?.type!=='APRINCAR_CONNECT'||event.data?.protocolVersion!==1||!event.ports?.[0]) return;
    port=event.ports[0];
    port.onmessage=ev=>{const m=ev.data;if(m?.type!=='host.response'||!m.requestId)return;const p=pending.get(m.requestId);if(!p)return;pending.delete(m.requestId);m.ok?p.resolve(m.payload):p.reject(new Error(m.error||'Host error'));};
    port.start();readyResolve();port.postMessage({type:'game.ready',payload:{protocolVersion:1}});
  });
  async function request(type,payload={}){
    await Promise.race([connected,new Promise(r=>setTimeout(r,350))]);
    if(!port){emitDemo(type,payload);return {demo:true};}
    const requestId=crypto.randomUUID();
    return new Promise((resolve,reject)=>{pending.set(requestId,{resolve,reject});port.postMessage({type,requestId,payload});});
  }
  window.aprincar={
    request,
    session:{start:(p={})=>request('session.start',p),complete:(p={})=>request('session.complete',p),abandon:(p={})=>request('session.abandon',p)},
    evidence:{submit:p=>request('evidence.submit',p)},
    rewards:{request:p=>request('reward.request',p)},
    storage:{get:key=>request('storage.get',{key}),set:(key,value)=>request('storage.set',{key,value}),remove:key=>request('storage.remove',{key})},
    capability:{request:(name,payload)=>request('capability.request',{name,payload})},
    demoEvents
  };
})();
