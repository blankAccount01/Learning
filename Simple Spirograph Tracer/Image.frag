void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec4 accumulated = texture(iChannel0, uv);

    fragColor = vec4(accumulated.rgb, 1.0);
}
