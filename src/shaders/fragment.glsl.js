const fragmentShader = `
    uniform sampler2D tImg;
    uniform sampler2D tLvl;
    uniform sampler2D tBack;

    varying vec2 vUv;
    varying vec2 vUvBck;
    varying vec2 vImg;

    struct ColorStop {
        vec3 color;
        float position;
    };

    void main() {
        // background gradient color
        ColorStop currentColor = ColorStop(##COLOR_BOTTOM, 0.0);
        ColorStop nextColor = ColorStop(##COLOR_TOP, 1.0);

        float range = nextColor.position - currentColor.position;
        float lerpFactor = (vUv.y - currentColor.position) / range;
            
        vec3 gradientColor = mix(currentColor.color, nextColor.color, lerpFactor);

        // image&level
        vec4 img = texture2D(tImg, vImg);
        vec4 lvl = texture2D(tLvl, vImg);
        vec4 monster = img + lvl;

        // overlay square
        vec2 sqSize = abs(vUv - vec2(0.5, 0.55)) - vec2(0.45, 0.4);
        float square = length(max(sqSize, 0.0));
        square = smoothstep(0.0, 0.0005, square);

        // front
        vec3 front = gradientColor * (square) + monster.xyz * (1. - square);
        
        // set front and back
        gl_FragColor = gl_FrontFacing ? vec4(front, 1.) : texture2D(tBack, vUvBck);
    }
`

export default fragmentShader
