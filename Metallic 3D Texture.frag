float sphereSDF(vec3 p, vec3 center, float radius) {
    return length(p-center)-radius;
}

float sdRoundBox( vec3 p, vec3 b, float r )
{
  vec3 q = abs(p) - b + r;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sceneSDF(vec3 p) {
    vec3 cubePos = vec3(0.0);
    vec3 localP = p-cubePos;
    float d2 = sdRoundBox(localP, vec3(1.), .3);
    float displacement = 0.05*sin(5.*localP.x) * cos(5.*localP.y);
    return d2-displacement;
    
}

float softShadrowMarch(vec3 ro, vec3 rd) {
    float res = 1.0;
    float t = 0.02;
    for (int i=0; i<32; i++) {
        float h = sceneSDF(ro+rd*t);
        if(h<0.001) return 0.0;
        res = min(res, 10.0*h/t);
        t+=h;
    }
    return clamp(res, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5*iResolution.xy) / iResolution.y;
    uv*=1.5;
    vec3 ro = vec3(3.*cos(iTime),3,3.*sin(iTime));
    vec3 target = vec3(0.0);
    vec3 forward = normalize(target - ro);
    vec3 right = normalize(cross(vec3(0.0,1.0,0.0), forward));
    vec3 up = cross(forward, right);
    vec3 rd = normalize(vec3(uv.x*right+uv.y*up+1.5*forward));
    
    float t = 0.0;
    float d;
    vec3 p;
    bool hitObj = false;
    
    for(int i=0; i<100; i++){
        p = ro +t*rd;
        d=sceneSDF(p);
        if (d < 0.001){
            hitObj = true;
            break;
        }
        t+=d;
        if (t>20.0) break;
    }
    
    vec3 color = vec3(0.1);
    //vec3 color = vec3(0.46,0.68,0.887);
    
    if (hitObj) {
        float e = 0.001;
        vec3 n = normalize(vec3(
            sceneSDF(p+vec3(e,0.,0.))- sceneSDF(p-vec3(e,0.,0.)),
            sceneSDF(p+vec3(0.,e,0.0))- sceneSDF(p-vec3(0.,e,0.)),
            sceneSDF(p+vec3(0.,0.,e))- sceneSDF(p-vec3(0.,0.,e))
        ));
        
        float eta = 1.0 / 1.5;
        vec3 refractedDir = refract(rd, n, eta);

        vec3 lightDir = normalize(vec3(1,1,1));
        vec3 fillLight = normalize(vec3(-1,0.0,-1));
        float diff2 = max(dot(n,fillLight), 0.0) * 0.3;
        
        vec3 viewDir = normalize(ro - p);
        float F0 = 0.04;
        float fresnel = F0 + (1.0 - F0) * pow(1.0 - max(dot(n, viewDir), 0.0), 5.0);
        vec3 halfDir = normalize(lightDir + viewDir);
        
        float spec = pow(max(dot(n,halfDir), 0.0), 64.0);
        
        float diff = max(dot(n, lightDir), 0.0);
        diff = pow(diff,5.);
        float ambient = 0.2;
        color = (diff+ambient) * vec3(0.9, 0.85, 0.85)+spec*0.5;
        color += diff2*vec3(1.0,0.8,0.6);
        color += fresnel * 1.5 *vec3(1.0);
        //color = 0.5 * n + 0.5;
    }
    fragColor = vec4(color,1.0);
}
