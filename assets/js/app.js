
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163/build/three.module.js';

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({
canvas,
antialias:true,
alpha:true
});

renderer.setSize(window.innerWidth,window.innerHeight);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.z=20;

const ambient = new THREE.AmbientLight(0xffffff,2);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xff00ff,6);
directional.position.set(5,5,5);
scene.add(directional);

const geometry = new THREE.IcosahedronGeometry(6,64);

const material = new THREE.MeshPhysicalMaterial({
color:0x7c4dff,
roughness:.2,
metalness:1,
transmission:.3,
emissive:0x220044,
emissiveIntensity:2
});

const sphere = new THREE.Mesh(geometry,material);

scene.add(sphere);

const particlesGeometry = new THREE.BufferGeometry();

const particleCount = 12000;

const positions = new Float32Array(particleCount*3);

for(let i=0;i<positions.length;i++){
positions[i]=(Math.random()-.5)*200;
}

particlesGeometry.setAttribute(
'position',
new THREE.BufferAttribute(positions,3)
);

const particlesMaterial = new THREE.PointsMaterial({
size:.15,
color:0x00ffff
});

const particles = new THREE.Points(
particlesGeometry,
particlesMaterial
);

scene.add(particles);

const matrixCanvas=document.getElementById('matrixCanvas');
const matrixCtx=matrixCanvas.getContext('2d');

matrixCanvas.width=window.innerWidth;
matrixCanvas.height=window.innerHeight;

const matrixWords=`
Ghost Matrix
Crimson Matrix
Neon Matrix
Quantum Matrix
Infinity Matrix
Warp Mode
Tunnel Mode
Spectral Mode
AI Ninja-Tech
DancePlanet DJ HiFi Engine
20 Band Equalizer
Dolby C
Bass Boost
Wave Spectrum
Cybernetic Frequency
Holographic Rendering
Reactive Particles
Neural Visual System
`.split(' ');

const fontSize=16;
const columns=matrixCanvas.width/fontSize;
const drops=[];

for(let i=0;i<columns;i++){
drops[i]=1;
}

function drawMatrix(){

matrixCtx.fillStyle='rgba(0,0,0,.06)';
matrixCtx.fillRect(0,0,matrixCanvas.width,matrixCanvas.height);

matrixCtx.font=fontSize+'px monospace';

for(let i=0;i<drops.length;i++){

const text=matrixWords[
Math.floor(Math.random()*matrixWords.length)
];

const hue=(Date.now()*.03+i*8)%360;

matrixCtx.fillStyle=`hsl(${hue},100%,60%)`;

matrixCtx.fillText(
text,
i*fontSize,
drops[i]*fontSize
);

if(drops[i]*fontSize>matrixCanvas.height
&& Math.random()>.975){
drops[i]=0;
}

drops[i]++;

}
}

let analyser;
let dataArray;
let audioContext;
let source;

const eqControls=document.getElementById('eqControls');

const frequencies=[
31,62,125,250,500,
1000,2000,4000,8000,16000,
40,80,160,320,640,
1250,2500,5000,10000,18000
];

const filters=[];

function buildEQ(){

frequencies.forEach(freq=>{

const filter=audioContext.createBiquadFilter();

filter.type='peaking';
filter.frequency.value=freq;
filter.gain.value=0;

filters.push(filter);

const band=document.createElement('div');
band.className='eqBand';

const slider=document.createElement('input');
slider.type='range';
slider.min='-20';
slider.max='20';
slider.value='0';
slider.className='eqSlider';

slider.addEventListener('input',()=>{
filter.gain.value=slider.value;
});

const label=document.createElement('span');
label.className='eqLabel';
label.textContent=freq;

band.appendChild(slider);
band.appendChild(label);

eqControls.appendChild(band);

});

}

async function setupMic(){

const stream=await navigator.mediaDevices.getUserMedia({
audio:true
});

audioContext=new AudioContext();

source=audioContext.createMediaStreamSource(stream);

analyser=audioContext.createAnalyser();

analyser.fftSize=2048;

dataArray=new Uint8Array(analyser.frequencyBinCount);

buildEQ();

let chain=source;

filters.forEach(filter=>{
chain.connect(filter);
chain=filter;
});

chain.connect(analyser);

}

document.getElementById('micBtn')
.addEventListener('click',setupMic);

document.getElementById('uploadBtn')
.addEventListener('click',()=>{
document.getElementById('audioFile').click();
});

document.getElementById('audioFile')
.addEventListener('change',async e=>{

const file=e.target.files[0];

if(!file)return;

audioContext=new AudioContext();

const audio=new Audio(
URL.createObjectURL(file)
);

audio.loop=true;

await audio.play();

source=audioContext.createMediaElementSource(audio);

analyser=audioContext.createAnalyser();

analyser.fftSize=2048;

dataArray=new Uint8Array(analyser.frequencyBinCount);

buildEQ();

let chain=source;

filters.forEach(filter=>{
chain.connect(filter);
chain=filter;
});

chain.connect(analyser);
analyser.connect(audioContext.destination);

});

const spectrumCanvas=document.getElementById('spectrumCanvas');
const spectrumCtx=spectrumCanvas.getContext('2d');

spectrumCanvas.width=window.innerWidth;
spectrumCanvas.height=window.innerHeight;

let currentMode='ghost_matrix';

document.querySelectorAll('.mode-btn')
.forEach(btn=>{

btn.addEventListener('click',()=>{

document.querySelectorAll('.mode-btn')
.forEach(b=>b.classList.remove('active'));

btn.classList.add('active');

currentMode=btn.dataset.mode;

});

});

function renderSpectrum(){

if(!analyser)return;

analyser.getByteFrequencyData(dataArray);

spectrumCtx.clearRect(
0,0,
spectrumCanvas.width,
spectrumCanvas.height
);

const barWidth=
spectrumCanvas.width/dataArray.length*2.5;

let x=0;

for(let i=0;i<dataArray.length;i++){

const barHeight=dataArray[i];

const hue=i/dataArray.length*360;

spectrumCtx.fillStyle=
`hsl(${hue},100%,50%)`;

spectrumCtx.fillRect(
x,
spectrumCanvas.height-barHeight,
barWidth,
barHeight
);

x+=barWidth+1;

}

const avg=dataArray.reduce((a,b)=>a+b,0)
/
dataArray.length;

document.getElementById('freq')
.innerText=Math.floor(avg*4);

document.getElementById('spectral')
.innerText=Math.max(...dataArray);

document.getElementById('modulation')
.innerText=Math.floor(avg/2)+'%';

document.getElementById('bpm')
.innerText=Math.floor(avg*1.2);

}

function animate(){

requestAnimationFrame(animate);

drawMatrix();

renderSpectrum();

let intensity=0;

if(analyser){

analyser.getByteFrequencyData(dataArray);

intensity=
dataArray.reduce((a,b)=>a+b,0)
/
dataArray.length
/
255;

}

sphere.rotation.x+=.004+intensity*.04;
sphere.rotation.y+=.006+intensity*.05;

particles.rotation.y+=.0008+intensity*.02;

sphere.scale.setScalar(
1+intensity*.8
);

if(currentMode==='warp_mode'){
camera.position.z=
10+Math.sin(Date.now()*.003)*5;
}

if(currentMode==='tunnel_mode'){
camera.position.x=
Math.sin(Date.now()*.001)*8;
}

if(currentMode==='spectral_mode'){
particlesMaterial.size=
.1+intensity*1.5;
}

renderer.render(scene,camera);

}

animate();

window.addEventListener('resize',()=>{

renderer.setSize(
window.innerWidth,
window.innerHeight
);

camera.aspect=
window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();

matrixCanvas.width=window.innerWidth;
matrixCanvas.height=window.innerHeight;

spectrumCanvas.width=window.innerWidth;
spectrumCanvas.height=window.innerHeight;

});
