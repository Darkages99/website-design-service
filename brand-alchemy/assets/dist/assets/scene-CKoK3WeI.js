const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./build-DFAspLsd.js","./three.module-C16rtgpX.js"])))=>i.map(i=>d[i]);
import{t as e}from"./main-BWmN_Gfo.js";import{S as t,a as n,b as r,h as i,i as a,o,r as s,s as c,t as l,v as u,x as d,y as f}from"./three.module-C16rtgpX.js";var p=`

vec3 ba_mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 ba_mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 ba_permute(vec4 x){ return ba_mod289(((x*34.0)+1.0)*x); }
vec4 ba_taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float ba_snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = ba_mod289(i);
  vec4 p = ba_permute(ba_permute(ba_permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = ba_taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}


vec3 ba_snoiseVec3(vec3 p){
  return vec3(
    ba_snoise(p),
    ba_snoise(vec3(p.y - 19.1, p.z + 33.4, p.x + 47.2)),
    ba_snoise(vec3(p.z + 74.2, p.x - 124.5, p.y + 99.4))
  );
}

vec3 ba_curl(vec3 p){
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 px0 = ba_snoiseVec3(p - dx); vec3 px1 = ba_snoiseVec3(p + dx);
  vec3 py0 = ba_snoiseVec3(p - dy); vec3 py1 = ba_snoiseVec3(p + dy);
  vec3 pz0 = ba_snoiseVec3(p - dz); vec3 pz1 = ba_snoiseVec3(p + dz);
  float x = (py1.z - py0.z) - (pz1.y - pz0.y);
  float y = (pz1.x - pz0.x) - (px1.z - px0.z);
  float z = (px1.y - px0.y) - (py1.x - py0.x);
  return normalize(vec3(x, y, z) / (2.0 * e));
}
`;function m(n,{tier:r=`full`}={}){let m=r===`full`,_;try{_=new l({canvas:n,antialias:m,alpha:!0,powerPreference:`high-performance`,failIfMajorPerformanceCaveat:!1})}catch(e){return console.warn(`[Brand-Alchemy] WebGL init failed; keeping static background.`,e),null}let v=m?2:1,y=Math.min(window.devicePixelRatio||1,v);_.setPixelRatio(y),_.setSize(window.innerWidth,window.innerHeight),_.setClearAlpha(0),_.toneMapping=4,_.toneMappingExposure=1;let b=new d;b.background=g();let x=new u(36,window.innerWidth/window.innerHeight,.1,100);x.position.set(0,0,3.6);let S=m?5e3:1e3,C=new Float32Array(S*3),w=new Float32Array(S),T=Math.PI*(3-Math.sqrt(5));for(let e=0;e<S;e++){let t=1-e/(S-1)*2,n=Math.sqrt(1-t*t),r=T*e,i=.82+h(e)*.34;C[e*3+0]=Math.cos(r)*n*i,C[e*3+1]=t*i,C[e*3+2]=Math.sin(r)*n*i,w[e]=h(e*7.13+2)}let E=new a;E.setAttribute(`position`,new s(C,3)),E.setAttribute(`aRand`,new s(w,1));let D={uTime:{value:0},uScroll:{value:0},uHover:{value:0},uFlow:{value:.2},uFreq:{value:.85},uSize:{value:m?26:30},uPixelRatio:{value:y},uColorA:{value:new c(16757084)},uColorB:{value:new c(1630346)}},O=new t({uniforms:D,transparent:!0,depthWrite:!1,blending:2,vertexShader:`
      uniform float uTime, uScroll, uHover, uFlow, uFreq, uSize, uPixelRatio;
      attribute float aRand;
      varying float vMix;
      varying float vAlpha;
      ${p}
      void main(){
        vec3 base = position;
        // swirl along the curl-noise field; speed varies per point
        vec3 flow = ba_curl(base * uFreq + uTime * 0.045);
        float amp = uFlow * (1.0 + uHover * 0.6);
        vec3 pos = base + flow * amp;
        // gentle breathing
        pos *= 1.0 + 0.05 * sin(uTime * 0.5 + aRand * 6.2831);
        // scroll: disperse outward + fade as the hero leaves
        pos += normalize(base) * uScroll * 1.5;

        vMix = clamp(pos.y * 0.5 + 0.55, 0.0, 1.0);
        vAlpha = 1.0 - uScroll * 0.92;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = uSize * (0.45 + aRand) * uPixelRatio;
        gl_PointSize = size * (1.0 / -mv.z);
      }
    `,fragmentShader:`
      uniform vec3 uColorA, uColorB;
      varying float vMix;
      varying float vAlpha;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        vec3 col = mix(uColorB, uColorA, vMix);
        col += pow(max(1.0 - d * 2.0, 0.0), 3.0) * 0.7; // bright core → feeds bloom
        gl_FragColor = vec4(col * soft * vAlpha, 1.0);
      }
    `}),k=new f(E,O);b.add(k);let A=null;m&&e(async()=>{let{EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i}=await import(`./build-DFAspLsd.js`);return{EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i}},__vite__mapDeps([0,1]),import.meta.url).then(({EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i})=>{let a=new e(_);a.addPass(new n(b,x)),a.addPass(new t(x,new r({intensity:.7,luminanceThreshold:.5,luminanceSmoothing:.4,mipmapBlur:!0,kernelSize:i.LARGE}))),a.setSize(window.innerWidth,window.innerHeight),A=a}).catch(e=>console.warn(`[Brand-Alchemy] bloom unavailable:`,e));function j(){let e=window.innerWidth,t=window.innerHeight,n=e/t;x.aspect=n,x.updateProjectionMatrix(),_.setSize(e,t),A&&A.setSize(e,t);let r=n>1?i.clamp((n-1)*1.2,0,1.7):0;k.position.x=r,x.position.z=n<.85?4.6:3.6}j();let M={x:0,y:0},N={x:0,y:0},P=0,F=0;function I(e){M.x=e.clientX/window.innerWidth*2-1,M.y=e.clientY/window.innerHeight*2-1,P=1}window.matchMedia(`(pointer: fine)`).matches&&window.addEventListener(`pointermove`,I,{passive:!0});let L=new o,R=0,z=!0;function B(){if(!z)return;R=requestAnimationFrame(B);let e=Math.min(L.getDelta(),.05);D.uTime.value+=e,N.x+=(M.x-N.x)*.045,N.y+=(M.y-N.y)*.045,D.uHover.value+=(P-D.uHover.value)*.05,D.uScroll.value+=(F-D.uScroll.value)*.08,P*=.96,k.rotation.y=D.uTime.value*.05+N.x*.4,k.rotation.x=-N.y*.3,A?A.render():_.render(b,x)}B();function V(){j()}window.addEventListener(`resize`,V,{passive:!0});function H(){document.hidden?(z=!1,cancelAnimationFrame(R)):z||(z=!0,L.getDelta(),B())}return document.addEventListener(`visibilitychange`,H),{setScroll(e){F=i.clamp(e,0,1)},setHover(e){P=Math.max(P,e)},destroy(){z=!1,cancelAnimationFrame(R),window.removeEventListener(`resize`,V),window.removeEventListener(`pointermove`,I),document.removeEventListener(`visibilitychange`,H),E.dispose(),O.dispose(),b.background&&b.background.dispose&&b.background.dispose(),A&&A.dispose(),_.dispose()}}}function h(e){let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)}function g(){let e=document.createElement(`canvas`);e.width=512,e.height=512;let t=e.getContext(`2d`);t.fillStyle=`#0a0a0f`,t.fillRect(0,0,512,512);let i=t.createRadialGradient(370,150,0,370,150,360);i.addColorStop(0,`rgba(255,153,51,0.22)`),i.addColorStop(1,`rgba(255,153,51,0)`),t.fillStyle=i,t.fillRect(0,0,512,512),i=t.createRadialGradient(120,410,0,120,410,340),i.addColorStop(0,`rgba(0,210,106,0.14)`),i.addColorStop(1,`rgba(0,210,106,0)`),t.fillStyle=i,t.fillRect(0,0,512,512);let a=new n(e);return a.colorSpace=r,a}export{m as mountScene};