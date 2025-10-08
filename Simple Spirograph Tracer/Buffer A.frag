
float sdSegment(vec2 p, vec2 a, vec2 b)
{
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

vec2 spiroPoint(float t, float R, float r, float d)
{
    float x = (R - r) * cos(t) + d * cos((R - r) / r * t);
    float y = (R - r) * sin(t) - d * sin((R - r) / r * t);
    return vec2(x, y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 pos = ((fragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) * 1.5;

    if (iFrame == 0)
    {
        fragColor = vec4(0.0);
        return;
    }
    if (iTime <=5.){
    fragColor = vec4(0.0);
        return;
    }

    vec4 prev = texture(iChannel0, uv);

    float R = 0.4;
    float r = 0.0001;
    float d = 0.1;

    float lineWidth = 0.003;

    float maxT = 6.28318 * 1000.0;
    float speed = .5;
    float dt = 0.00001;

    float t = clamp(iTime * speed, 0.0, maxT);

    float line = 0.0;
    for (int i = 0; i < 20; i++)
    {
        float t0 = max(t - dt * float(i + 1), 0.0);
        float t1 = max(t - dt * float(i), 0.0);

        vec2 p0 = spiroPoint(t0, R, r, d);
        vec2 p1 = spiroPoint(t1, R, r, d);

        float dist = sdSegment(pos, p0, p1);

        line = max(line, smoothstep(lineWidth, 0.0, dist));
    }

    float accum = max(prev.r, line);

    fragColor = vec4(accum, accum, accum, 1.0);
}
