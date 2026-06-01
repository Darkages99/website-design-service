const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./build-iGLCNCty.js","./three.module-CCOjopKd.js"])))=>i.map(i=>d[i]);
import{t as e}from"./main-DyUxmEp5.js";import{A as t,C as n,S as r,a as i,b as a,g as o,h as s,i as c,k as l,o as ee,r as u,s as d,t as f,v as p,w as m,x as h,y as te}from"./three.module-CCOjopKd.js";function g(r,{tier:i=`full`}={}){let g=i===`full`,y;try{y=new f({canvas:r,antialias:g,alpha:!0,powerPreference:`high-performance`,failIfMajorPerformanceCaveat:!1})}catch(e){return console.warn(`[Brand-Alchemy] WebGL init failed; keeping static background.`,e),null}let ne=g?2:1,b=Math.min(window.devicePixelRatio||1,ne);y.setPixelRatio(b),y.setSize(window.innerWidth,window.innerHeight),y.setClearAlpha(0),y.toneMapping=4,y.toneMappingExposure=1;let x=new n;x.background=v();let S=new p(44,window.innerWidth/window.innerHeight,.1,100),C=new t(0,1.35,3.4);S.position.copy(C),S.lookAt(0,.05,-3.6);let w=new te(60,48),T={uTime:{value:0},uScroll:{value:0},uReaction:{value:0}},E=new m({uniforms:T,transparent:!0,depthWrite:!1,vertexShader:`
      varying vec3 vWorld;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,fragmentShader:`
      precision highp float;
      varying vec3 vWorld;
      uniform float uTime, uScroll, uReaction;
      void main(){
        // grid flows toward the camera (camera "travels" along the surface)
        vec2 g = vec2(vWorld.x, vWorld.z + uTime * 0.55 + uScroll * 4.0) * 0.62;
        vec2 cell = abs(fract(g) - 0.5);
        float m = max(cell.x, cell.y);
        float line = smoothstep(0.46, 0.5, m);
        // fade with distance: near = visible, far = gone
        float depth = clamp((vWorld.z + 20.0) / 20.0, 0.0, 1.0);
        float fade = depth * depth;
        vec3 base    = vec3(0.045, 0.055, 0.085);
        vec3 lineCol = mix(vec3(0.10, 0.14, 0.20), vec3(0.10, 0.34, 0.40), clamp(uScroll * 0.6 + uReaction * 0.5, 0.0, 1.0));
        vec3 col = mix(base, lineCol, line);
        float alpha = (0.05 + line * 0.40) * fade;
        gl_FragColor = vec4(col, alpha);
      }
    `}),D=new o(w,E);D.rotation.x=-Math.PI/2,D.position.y=0,D.renderOrder=0,x.add(D);let O=g?900:320,k=new Float32Array(O),A=new Float32Array(O),j=new Float32Array(O),M=new Float32Array(O);for(let e=0;e<O;e++)k[e]=(_(e*1.13)*2-1)*8.5,A[e]=_(e*2.31+.7),j[e]=.6+_(e*3.77+1.3)*.9,M[e]=_(e*5.19+2.9);let N=new c;N.setAttribute(`position`,new u(new Float32Array(O*3),3)),N.setAttribute(`aLane`,new u(k,1)),N.setAttribute(`aSeed`,new u(A,1)),N.setAttribute(`aSpeed`,new u(j,1)),N.setAttribute(`aOff`,new u(M,1));let P={uTime:{value:0},uScroll:{value:0},uReaction:{value:0},uHover:{value:0},uMouse:{value:new l(100,100)},uSize:{value:g?26:30},uPixelRatio:{value:b},uGray:{value:new d(9081766)},uGold:{value:new d(16757084)},uGreen:{value:new d(2089098)},uCyan:{value:new d(3727871)}},F=new m({uniforms:P,transparent:!0,depthWrite:!1,blending:2,vertexShader:`
      uniform float uTime, uScroll, uReaction, uHover, uSize, uPixelRatio;
      uniform vec2 uMouse;
      attribute float aLane, aSeed, aSpeed, aOff;
      varying float vConv;
      varying float vFlash;
      varying float vAlpha;
      varying float vSeed;
      void main(){
        float rate = 0.045 + uScroll * 0.085 + uHover * 0.02;
        float life = fract(aOff + uTime * rate * aSpeed);
        float z = mix(-16.0, 2.0, life);
        float x = aLane + sin(life * 6.2831 + aSeed * 6.2831) * 0.25;

        float conv = 0.5 + (aSeed - 0.5) * 0.06;
        // cursor = catalyst hotspot: nearby reactants convert earlier + flare
        float md = distance(vec2(x, z), uMouse);
        float hot = smoothstep(2.4, 0.0, md);
        conv -= hot * 0.22;

        float risen = clamp((life - conv) / (1.0 - conv), 0.0, 1.0);
        float y = risen * risen * 1.2; // rise after conversion

        vConv = smoothstep(conv - 0.01, conv + 0.05, life);
        vFlash = exp(-pow((life - conv) / 0.05, 2.0)); // bright spike at conversion
        vSeed = aSeed;
        vAlpha = smoothstep(0.0, 0.05, life) * (1.0 - smoothstep(0.78, 1.0, life));

        vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
        gl_Position = projectionMatrix * mv;
        float sz = uSize * (0.55 + aSeed * 0.7) * (1.0 + vConv * 0.5 + hot * 1.6);
        gl_PointSize = sz * uPixelRatio * (1.0 / -mv.z);
      }
    `,fragmentShader:`
      precision highp float;
      uniform vec3 uGray, uGold, uGreen, uCyan;
      uniform float uReaction;
      varying float vConv, vFlash, vAlpha, vSeed;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.0, d);
        vec3 prodBase = mix(uGold, uGreen, vSeed);          // product varies gold↔green
        vec3 prod = mix(prodBase, uCyan, uReaction * 0.5);  // → cyan as the reaction completes
        vec3 col = mix(uGray, prod, vConv);
        col += vFlash * 1.4;                                // conversion flash (feeds bloom)
        col += pow(max(1.0 - d * 2.0, 0.0), 3.0) * 0.5;     // soft core
        gl_FragColor = vec4(col, soft * vAlpha);
      }
    `}),I=new a(N,F);I.renderOrder=1,I.frustumCulled=!1,x.add(I);let L=null;g&&e(async()=>{let{EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i}=await import(`./build-iGLCNCty.js`);return{EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i}},__vite__mapDeps([0,1]),import.meta.url).then(({EffectComposer:e,EffectPass:t,RenderPass:n,BloomEffect:r,KernelSize:i})=>{let a=new e(y);a.addPass(new n(x,S)),a.addPass(new t(S,new r({intensity:.55,luminanceThreshold:.55,luminanceSmoothing:.4,mipmapBlur:!0,kernelSize:i.LARGE}))),a.setSize(window.innerWidth,window.innerHeight),L=a}).catch(e=>console.warn(`[Brand-Alchemy] bloom unavailable:`,e));function R(){let e=window.innerWidth,t=window.innerHeight,n=e/t;S.aspect=n,C.set(0,n<.9?1.7:1.35,n<.9?3.9:3.4),S.fov=n<.9?52:44,S.position.copy(C),S.lookAt(0,.05,-3.6),S.updateProjectionMatrix(),y.setSize(e,t),L&&L.setSize(e,t)}R();let z={x:0,y:0},B={x:0,y:0},V=new h,H=new l,U=new l(100,100),W=0,G=0,K=0;function q(e){z.x=e.clientX/window.innerWidth*2-1,z.y=e.clientY/window.innerHeight*2-1,H.set(z.x,-z.y),V.setFromCamera(H,S);let t=V.ray.origin,n=V.ray.direction;if(Math.abs(n.y)>1e-4){let e=-t.y/n.y;e>0&&e<60&&U.set(t.x+n.x*e,t.z+n.z*e)}W=1}window.matchMedia(`(pointer: fine)`).matches&&window.addEventListener(`pointermove`,q,{passive:!0});let J=new ee,Y=0,X=!0;function Z(){if(!X)return;Y=requestAnimationFrame(Z),Math.min(J.getDelta(),.05);let e=J.elapsedTime;P.uTime.value=e,T.uTime.value=e,B.x+=(z.x-B.x)*.045,B.y+=(z.y-B.y)*.045,P.uHover.value+=(W-P.uHover.value)*.05,P.uScroll.value+=(G-P.uScroll.value)*.08,P.uReaction.value+=(K-P.uReaction.value)*.06,T.uScroll.value=P.uScroll.value,T.uReaction.value=P.uReaction.value,P.uMouse.value.x+=(U.x-P.uMouse.value.x)*.12,P.uMouse.value.y+=(U.y-P.uMouse.value.y)*.12,W*=.96,S.position.x=C.x+B.x*.18,S.position.y=C.y-B.y*.1,S.lookAt(0,.05,-3.6),L?L.render():y.render(x,S)}Z();function Q(){R()}window.addEventListener(`resize`,Q,{passive:!0});function $(){document.hidden?(X=!1,cancelAnimationFrame(Y)):X||(X=!0,J.getDelta(),Z())}return document.addEventListener(`visibilitychange`,$),{setScroll(e){G=s.clamp(e,0,1)},setReaction(e){K=s.clamp(e,0,1)},setHover(e){W=Math.max(W,e)},destroy(){X=!1,cancelAnimationFrame(Y),window.removeEventListener(`resize`,Q),window.removeEventListener(`pointermove`,q),document.removeEventListener(`visibilitychange`,$),w.dispose(),E.dispose(),N.dispose(),F.dispose(),x.background&&x.background.dispose&&x.background.dispose(),L&&L.dispose(),y.dispose()}}}function _(e){let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)}function v(){let e=document.createElement(`canvas`);e.width=512,e.height=512;let t=e.getContext(`2d`);t.fillStyle=`#08090e`,t.fillRect(0,0,512,512);let n=t.createRadialGradient(256,480,0,256,480,320);n.addColorStop(0,`rgba(255,153,51,0.16)`),n.addColorStop(1,`rgba(255,153,51,0)`),t.fillStyle=n,t.fillRect(0,0,512,512),n=t.createRadialGradient(90,470,0,90,470,300),n.addColorStop(0,`rgba(31,224,138,0.13)`),n.addColorStop(1,`rgba(31,224,138,0)`),t.fillStyle=n,t.fillRect(0,0,512,512),n=t.createRadialGradient(430,450,0,430,450,280),n.addColorStop(0,`rgba(56,225,255,0.09)`),n.addColorStop(1,`rgba(56,225,255,0)`),t.fillStyle=n,t.fillRect(0,0,512,512);let a=new i(e);return a.colorSpace=r,a}export{g as mountScene};