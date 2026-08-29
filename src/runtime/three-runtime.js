(()=>{
const CFG=window.APRINCAR_GAME_CONFIG, THREE=window.THREE;
const root=document.getElementById('game');
root.innerHTML=`<div class="three-ui"><div class="three-brand">APRINCAR</div><div id="three-level">Fase 1</div><h1 id="three-prompt"></h1><p id="three-status">Toque na forma correta.</p></div><canvas id="three-canvas"></canvas>`;
const canvas=document.getElementById('three-canvas');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.background=new THREE.Color(0xf7f6f2);
const camera=new THREE.PerspectiveCamera(52,1,.1,100);camera.position.set(0,2.2,8);
scene.add(new THREE.HemisphereLight(0xffffff,0x7b6bbd,2.1));const dl=new THREE.DirectionalLight(0xffffff,2.2);dl.position.set(4,6,5);scene.add(dl);
const floor=new THREE.Mesh(new THREE.CircleGeometry(6,64),new THREE.MeshStandardMaterial({color:0xefeafe,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.7;scene.add(floor);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let objects=[],level=1,answer='',locked=false;
const defs=[
 {id:'cube',label:'cubo',geom:()=>new THREE.BoxGeometry(1.6,1.6,1.6),color:0x6f5bd7},
 {id:'sphere',label:'esfera',geom:()=>new THREE.SphereGeometry(1.05,40,24),color:0x62a6d8},
 {id:'cone',label:'cone',geom:()=>new THREE.ConeGeometry(1.05,1.9,40),color:0xf07867},
 {id:'cylinder',label:'cilindro',geom:()=>new THREE.CylinderGeometry(.95,.95,1.8,40),color:0x65a67a},
];
function resize(){const rect=root.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
function clear(){for(const o of objects){scene.remove(o);o.geometry.dispose();o.material.dispose();}objects=[];}
function round(){clear();locked=false;document.getElementById('three-level').textContent=`Fase ${level}`;const pool=[...defs].sort(()=>Math.random()-.5).slice(0,Math.min(4,3+Math.floor(level/5)));answer=pool[Math.floor(Math.random()*pool.length)].id;document.getElementById('three-prompt').textContent=`Encontre o ${pool.find(x=>x.id===answer).label}`;document.getElementById('three-status').textContent='Arraste para observar e toque na forma correta.';pool.forEach((d,i)=>{const mat=new THREE.MeshStandardMaterial({color:d.color,roughness:.45,metalness:.04});const mesh=new THREE.Mesh(d.geom(),mat);mesh.position.set((i-(pool.length-1)/2)*2.4,0,0);mesh.userData=d;scene.add(mesh);objects.push(mesh);});}
async function choose(mesh){if(locked)return;locked=true;const ok=mesh.userData.id===answer;document.getElementById('three-status').textContent=ok?'Isso! Você reconheceu a forma ✨':'Quase! Gire e observe de novo.';await aprincar.evidence.submit({skillId:CFG.skillId,result:ok?'success':'failure',independent:true,assistance:'none',difficulty:Math.min(1,.25+level*.045),confidence:.9,attempts:1,metadata:{level,target:answer,selected:mesh.userData.id}});if(ok){await aprincar.rewards.request({reason:'geometry-3d',amount:2});setTimeout(()=>{level++;round();},850);}else{locked=false;}}
let dragging=false,lastX=0;canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;});canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=(e.clientX-lastX)*.012;lastX=e.clientX;objects.forEach(o=>o.rotation.y+=dx);});canvas.addEventListener('pointerup',e=>{if(Math.abs(e.clientX-lastX)>5){dragging=false;return;}dragging=false;const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(objects)[0];if(hit)choose(hit.object);});
(async()=>{await aprincar.session.start({mode:'geometry-3d'});round();})();
function loop(t){objects.forEach((o,i)=>{o.rotation.y+=.004+i*.001;o.position.y=Math.sin(t*.001+i)*.08;});renderer.render(scene,camera);requestAnimationFrame(loop);}requestAnimationFrame(loop);
})();
