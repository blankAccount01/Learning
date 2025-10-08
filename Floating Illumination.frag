//Inspired by https://www.shadertoy.com/view/Wt3XRX

#define MAX_STEPS 128
#define FOG_RANGE 60.0
#define DENSITY 0.1

const vec3 lightDir = normalize(vec3(0.5,0.6,-.8));

mat3 rotationY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
         c, 0.0, s,
         0.0, 1.0, 0.0,
        -s, 0.0, c
    );
}

struct Camera {
    vec3 pos;
    vec3 dir;
    vec3 up;
    vec3 right;
};

float box( vec3 p, vec3 b )
{
  vec3 point = abs(p) - b;
  float calc = length(max(point,0.0));
  return  calc + min(max(point.x,max(point.y,point.z)),0.0);
}

Camera getCam(float t) {
    Camera cam;
    //cam.pos = vec3(5,5,-5);//
    cam.pos = vec3(5.*sin(iTime), 3, 5.*cos(iTime));
    cam.dir = normalize(vec3(0.0) - cam.pos);
    cam.right = normalize(cross(vec3(0.0,1.0,0.0), cam.dir));
    cam.up = cross(cam.dir, cam.right);
    return cam;
}

vec3 uv2dir(Camera cam, vec2 uv){
    return normalize(cam.dir + uv.x * cam.right + uv.y *cam.up);
}

float sdf(vec3 p ){
     p = rotationY(radians(45.)) * p;
    float box1 = box( p-vec3(-0.6,0.0,-0.4), vec3 (0.3,1.,0.3) );
    float box2 = box( p-vec3(-0.4,0.9,0.3), vec3 (0.3,0.3,0.8) );
    float box3 = box( p-vec3(0,0.0,0.9), vec3 (0.3,1.,0.3) );
    return min(min(box1,box2),box3);
}

vec3 estimateNormal(vec3 p){
    float h = 0.001;
    return normalize(vec3(
        sdf(p+vec3(h, 0, 0.)) - sdf(p-vec3(h, 0, 0.)),
        sdf(p+vec3(0, h, 0.)) - sdf(p-vec3(0., h, 0.)),
        sdf(p+vec3(0., 0, h)) - sdf(p-vec3(0, 0, h))
    ));
}

float raymarch(vec3 ro, vec3 rd, out vec3 hitPos) {
    float t = 0.0;
    for (int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t;
        float d = sdf(p);
        if(d<0.001){
            hitPos = p;
            return t;
        }
        t+=d;
        if (t>FOG_RANGE) break;
    }
    return -1.0;
}

float raymarchShadow(vec3 ro, vec3 rd){
    float t = 0.01;
    for (int i = 0; i<50; i++){
        float d = sdf(ro+rd*t);
        if (d< 0.001) return 0.0;
        t += d;
        if(t > 10.0) break;
    }
    return 1.0;
}

vec3 directLight(vec3 pos, vec3 normal){
    float visibility = raymarchShadow(pos+normal*0.01, -lightDir);
    float diff = max(dot(normal, -lightDir), 0.0);
    return vec3(1.0) * diff * visibility;
}

vec3 henyeyGreenstein(vec3 lightDir, vec3 viewDir){
    float g = .5;
    float cosTheta = dot(lightDir, viewDir);
    float thing = 1.0 + g * g - 2.0 * g * cosTheta;
    float phase = (1.0 - g * g) / (4.0 * 3.14 * pow(thing, 1.5));
    return vec3(phase);
}

void mainImage(out vec4 o, in vec2 coord) {
    vec2 uv = (coord - 0.5 * iResolution.xy) / iResolution.y;
    Camera cam = getCam(iTime);
    vec3 rayDir = uv2dir(cam, uv);
    vec3 rayPos = cam.pos;
    
    vec3 color = vec3(0.0);
    vec3 hitPos;
    bool hit = false;
    
    float t = raymarch(rayPos, rayDir, hitPos);
    if (t>0.){
        vec3 normal = estimateNormal(hitPos);
        color = directLight(hitPos, normal);
        hit = true;
    }
    
    float maxDist = hit ? t : FOG_RANGE;
    float stepDist = maxDist / float (MAX_STEPS);
    vec3 transmittance = vec3(1.0);
    vec3 fogAccum = vec3(0.0);
    
    float jitter = texture(iChannel0, coord/iResolution.xy).r;
    rayPos +=rayDir * stepDist * jitter;
    
    for(int i = 0; i< MAX_STEPS; i++){
        float localDensity = DENSITY;
        
        float noise = texture(iChannel0, rayPos.xz*0.1).r;
        localDensity *= mix(0.4,3., noise);
        
        vec3 stepAbs = exp(vec3(-localDensity * stepDist));
        vec3 phase = (vec3(1.0)-stepAbs) * henyeyGreenstein(-lightDir, rayDir);
        
        float visibility = raymarchShadow(rayPos, -lightDir);
        vec3 light = vec3(3) * visibility;
        fogAccum +=phase * transmittance * light;
        if(visibility<0.01) fogAccum -=vec3(0.001);
        transmittance *= stepAbs;
        rayPos += rayDir * stepDist;
    }
    
    vec3 finalColor = color * transmittance+fogAccum;
    
    float sun = pow(max(dot(rayDir, -lightDir), 0.0), 1000.0);
    finalColor +=vec3(1.0, 0.9,0.7) * sun;
    
    finalColor = pow(finalColor, vec3(0.45));
    
    o = vec4(finalColor, 1.0);
}
