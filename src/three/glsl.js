/**
 * GLSL building blocks for the Alchemy Sphere, inlined as JS template strings
 * (no vite-plugin-glsl dependency). These are injected into the stock
 * MeshStandardMaterial shader via onBeforeCompile so we keep real PBR
 * metalness + env-map reflections and just add a noise-driven displacement.
 *
 * All code is GLSL ES 1.00 compatible (three rewrites stock chunks; our
 * injected code must stay GLSL1-safe: constant-bound loops, no texture()).
 */

/* Ashima / Stefan Gustavson simplex 3D noise — public domain.
   https://github.com/ashima/webgl-noise */
const SIMPLEX_3D = /* glsl */ `
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
`

/* Uniform + varying declarations and the displacement field. Injected into
   the VERTEX shader's <common> chunk. `dir` is a unit direction on the sphere
   (== normalized position, since radius is 1), so displacement is purely
   radial and we can recompute normals from neighbouring directions. */
export const VERTEX_COMMON = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uSpeed;
uniform float uScroll;
uniform float uHover;
varying float vDisp;
${SIMPLEX_3D}

float ba_fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 4; i++){
    v += a * ba_snoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

float ba_field(vec3 dir){
  float t = uTime * uSpeed;
  return ba_fbm(dir * uFreq + vec3(0.0, 0.0, t));
}

vec3 ba_displace(vec3 dir){
  float n = ba_field(dir);
  float amp = uAmp * (1.0 + uHover * 0.55) * (1.0 - uScroll * 0.65);
  return dir * (1.0 + n * amp);
}
`

/* Recompute the surface normal from the displaced field using two tangent
   neighbours. Replaces <beginnormal_vertex>. */
export const BEGINNORMAL = /* glsl */ `
vec3 baDir = normalize(normal);
vec3 baRef = abs(baDir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
vec3 baTan = normalize(cross(baRef, baDir));
vec3 baBit = cross(baDir, baTan);
float baEps = 0.0028;
vec3 baP0 = ba_displace(baDir);
vec3 baP1 = ba_displace(normalize(baDir + baTan * baEps));
vec3 baP2 = ba_displace(normalize(baDir + baBit * baEps));
vec3 objectNormal = normalize(cross(baP1 - baP0, baP2 - baP0));
if (dot(objectNormal, baDir) < 0.0) objectNormal = -objectNormal;
#ifdef USE_TANGENT
  vec3 objectTangent = vec3( tangent.xyz );
#endif
`

/* Apply the displacement to the vertex position + pass the field value to the
   fragment shader for the gold/green emissive shimmer. Replaces <begin_vertex>. */
export const BEGINVERTEX = /* glsl */ `
vDisp = ba_field(normalize(normal));
vec3 transformed = ba_displace(normalize(normal));
`

/* Fragment declarations. Injected into the FRAGMENT shader's <common> chunk. */
export const FRAGMENT_COMMON = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uEmissive;
varying float vDisp;
`

/* Drive a subtle two-tone emissive from the displacement: peaks glow gold (and
   feed the bloom), valleys read cooler green. Appended after <emissivemap_fragment>. */
export const FRAGMENT_EMISSIVE = /* glsl */ `
float baEd = smoothstep(-0.25, 0.65, vDisp);
vec3 baAlch = mix(uColorB, uColorA, baEd);
totalEmissiveRadiance += baAlch * uEmissive * (0.18 + baEd * baEd);
`
