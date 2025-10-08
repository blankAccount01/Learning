#iChannel0 input: Any Audio Track
float box(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}
float bands[9];

void getaudiobands(out float bands[9]){
    for (int i = 0; i<9; i++){
        float x = float(i) / 8.0;
        bands[i] = texture(iChannel0, vec2(x,0.25)).r;
    }
}

float scene(vec3 p ){
    float d = 999.0;
    int index = 0;
    for(int i = -1; i<=1;i++){
        for(int j = -1; j<=1;j++){
            float band = bands[index];
            
            float yOffset = band*0.8;
            vec3 offset = vec3(float(i) * 0.3, 0.0, float(j) * 0.3);
            d = min(d, box(p-offset, vec3(0.1,yOffset+0.2,0.1)));
            index++;
        }
    }
    return d;
}

vec3 getNormal(vec3 p){
    float h = 0.001;
    vec2 k = vec2(1, -1);
    return normalize(
        k.xyy*scene(p+k.xyy * h)+
        k.yyx*scene(p+k.yyx * h)+
        k.yxy*scene(p+k.yxy * h)+
        k.xxx * scene(p+k.xxx *h)
    );
}

vec3 getRayDir(vec2 uv, vec3 ro, vec3 lookAt, float zoom) {
    vec3 forward = normalize(lookAt - ro);
    vec3 right = normalize(cross(vec3(0.0,1.0,0.0), forward));
    vec3 up = cross(forward, right);
    
    return normalize(uv.x * right + uv.y * up + zoom * forward);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-0.5 *iResolution.xy)/iResolution.y;
    getaudiobands(bands);
    vec3 ro = vec3(2.0, 2.0, 2);
    vec3 target = vec3(0.0);
    vec3 rd = getRayDir(uv, ro, target,1.5);
    
    float t = 0.0;
    float d;
    int steps = 0;
    int maxsteps = 100;
    float maxdist = 10.0;
    const float surfdist = 0.001;
    
    for(int i = 0; i<maxsteps;i++){
        vec3 p = ro + rd * t;
        d = scene(p);
        if (d < surfdist || t > maxdist) break;
        t+=d;
        steps++;
    }
    
    vec3 color = vec3(0.0);
    if(d < surfdist){
        vec3 p = ro+rd *t;
        vec3 normal = getNormal(p);
        
        vec3 lightPos = vec3(0.5,0.5,1.5);
        vec3 lightDir = normalize(lightPos - p);

        float diff = clamp(dot(normal, lightDir), 0.0, 1.0);
        float dist = length(lightPos - p);
        float attenuation = 1.0 / (0.2 + 0.3 * dist + 0.5 * dist * dist);
        
        vec3 lightColor = vec3(1.0, 0.85, 0.7);
        vec3 ambient = vec3(0.1);
        
        color = ambient + diff * attenuation * lightColor;
    }
    
    fragColor = vec4(color,1.0);
}
