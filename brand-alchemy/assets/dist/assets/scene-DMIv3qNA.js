const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./build-60nMb4wU.js","./three.module-BLkX8U5V.js"])))=>i.map(i=>d[i]);
import{t as e}from"./main-DdZugAOx.js";import{D as t,S as n,_ as r,a as i,b as a,g as o,h as s,o as c,s as l,t as u,x as d,y as f}from"./three.module-BLkX8U5V.js";function p(i,{tier:a=`full`}={}){let p=a===`full`,h;try{h=new u({canvas:i,antialias:!1,alpha:!0,powerPreference:`high-performance`,failIfMajorPerformanceCaveat:!1})}catch(e){return console.warn(`[Brand-Alchemy] WebGL init failed; keeping static background.`,e),null}let g=p?2:1,_=Math.min(window.devicePixelRatio||1,g);h.setPixelRatio(_),h.setSize(window.innerWidth,window.innerHeight),h.setClearAlpha(0),h.toneMapping=4,h.toneMappingExposure=1;let v=new d;v.background=m();let y=new r(-1,1,1,-1,0,1),b={uTime:{value:0},uScroll:{value:0},uReaction:{value:0},uHover:{value:0},uMouse:{value:new t(.5,0)},uAspect:{value:window.innerWidth/Math.max(1,window.innerHeight)},uGold:{value:new l(16757084)},uGreen:{value:new l(2089098)},uCyan:{value:new l(3727871)},uDeep:{value:new l(463372)}},x=new n({uniforms:b,transparent:!0,depthWrite:!1,depthTest:!1,vertexShader:`
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0); // full-screen clip-space quad
      }
    `,fragmentShader:`
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uScroll, uReaction, uHover, uAspect;
      uniform vec2 uMouse;
      uniform vec3 uGold, uGreen, uCyan, uDeep;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i), b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      void main(){
        float x = vUv.x;
        // base level rises as you scroll; product reaction nudges it a touch higher
        float level = 0.15 + uScroll * 0.20 + uReaction * 0.04;
        // viscous surface: slow low-frequency waves + a little drifting noise
        float w = sin(x * 6.0 + uTime * 0.55) * 0.011
                + sin(x * 11.0 - uTime * 0.42) * 0.006
                + (noise(vec2(x * 3.0, uTime * 0.14)) - 0.5) * 0.012;
        // gentle, local cursor dimple — eased + gated by hover so it never cascades
        float mdx = (x - uMouse.x) * uAspect;
        float dip = exp(-mdx * mdx * 7.0) * 0.020 * smoothstep(0.0, 0.2, uHover);
        float surface = level + w - dip;

        float below = surface - vUv.y; // > 0 inside the liquid

        if (below < 0.0){
          // above the surface: a soft glow rising off the metal, otherwise transparent
          float ag = exp(-pow((vUv.y - surface) / 0.11, 2.0)) * 0.13;
          vec3 gcol = mix(uGold, mix(uGreen, uCyan, uReaction), uReaction);
          gl_FragColor = vec4(gcol * ag, ag);
          return;
        }

        float depth = clamp(below, 0.0, 1.0);
        // molten gradient: bright metal at the surface → dark deep
        vec3 surfCol = mix(uGold, uCyan, uReaction * 0.55);
        surfCol = mix(surfCol, uGreen, smoothstep(0.0, 0.5, depth) * 0.45);
        vec3 col = mix(surfCol, uDeep, smoothstep(0.0, 0.40, depth));

        // drifting specular streaks — reflective "mercury/gold"; more mirror-like with scroll
        float streak = sin(x * 22.0 + sin(x * 5.0 + uTime * 0.5) * 2.0 - uTime * 0.8);
        streak = pow(max(streak, 0.0), 6.0);
        float reflectivity = 0.32 + uScroll * 0.4;
        col += streak * reflectivity * (1.0 - depth * 1.5) * mix(uGold, uCyan, uReaction);

        // bright meniscus highlight right at the surface line (feeds bloom)
        float edge = exp(-pow((vUv.y - surface) / 0.0055, 2.0));
        col += edge * 1.3 * mix(uGold, uCyan, uReaction * 0.5);

        col *= (0.82 + 0.18 * depth);
        gl_FragColor = vec4(col, 1.0);
      }
    `}),S=new o(new f(2,2),x);S.frustumCulled=!1,v.add(S);let C=null;p&&e(async()=>{let{EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i}=await import(`./build-60nMb4wU.js`);return{EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i}},__vite__mapDeps([0,1]),import.meta.url).then(({EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i})=>{let a=new e(h);a.addPass(new n(v,y)),a.addPass(new t(y,new r({intensity:.7,luminanceThreshold:.6,luminanceSmoothing:.45,mipmapBlur:!0,kernelSize:i.LARGE}))),a.setSize(window.innerWidth,window.innerHeight),C=a}).catch(e=>console.warn(`[Brand-Alchemy] bloom unavailable:`,e));function w(){let e=window.innerWidth,t=window.innerHeight;h.setSize(e,t),C&&C.setSize(e,t),b.uAspect.value=e/Math.max(1,t)}w();let T=new t(.5,0),E=0,D=0,O=0;function k(e){T.set(e.clientX/window.innerWidth,1-e.clientY/window.innerHeight),E=1}window.matchMedia(`(pointer: fine)`).matches&&window.addEventListener(`pointermove`,k,{passive:!0});let A=new c,j=0,M=!0;function N(){M&&(j=requestAnimationFrame(N),A.getDelta(),b.uTime.value=A.elapsedTime,b.uHover.value+=(E-b.uHover.value)*.05,b.uScroll.value+=(D-b.uScroll.value)*.08,b.uReaction.value+=(O-b.uReaction.value)*.06,b.uMouse.value.x+=(T.x-b.uMouse.value.x)*.05,b.uMouse.value.y+=(T.y-b.uMouse.value.y)*.05,E*=.94,C?C.render():h.render(v,y))}N();function P(){w()}window.addEventListener(`resize`,P,{passive:!0});function F(){document.hidden?(M=!1,cancelAnimationFrame(j)):M||(M=!0,A.getDelta(),N())}return document.addEventListener(`visibilitychange`,F),{setScroll(e){D=s.clamp(e,0,1)},setReaction(e){O=s.clamp(e,0,1)},setHover(e){E=Math.max(E,e)},destroy(){M=!1,cancelAnimationFrame(j),window.removeEventListener(`resize`,P),window.removeEventListener(`pointermove`,k),document.removeEventListener(`visibilitychange`,F),S.geometry.dispose(),x.dispose(),v.background&&v.background.dispose&&v.background.dispose(),C&&C.dispose(),h.dispose()}}}function m(){let e=document.createElement(`canvas`);e.width=512,e.height=512;let t=e.getContext(`2d`);t.fillStyle=`#08090e`,t.fillRect(0,0,512,512);let n=t.createRadialGradient(256,512,0,256,512,330);n.addColorStop(0,`rgba(255,153,51,0.16)`),n.addColorStop(1,`rgba(255,153,51,0)`),t.fillStyle=n,t.fillRect(0,0,512,512),n=t.createRadialGradient(120,500,0,120,500,260),n.addColorStop(0,`rgba(31,224,138,0.10)`),n.addColorStop(1,`rgba(31,224,138,0)`),t.fillStyle=n,t.fillRect(0,0,512,512);let r=new i(e);return r.colorSpace=a,r}export{p as mountScene};