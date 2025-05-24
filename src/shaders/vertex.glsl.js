const vertexShader = `
    varying vec2 vUv;
    varying vec2 vUvBck;
    varying vec2 vImg;

    void main() {
        vUv = uv;
        vUvBck = uv;
        vUvBck.x = 1. - vUvBck.x;

        // set image position
        float scale = 1.2;
        vImg.x = uv.x * 1.1 - 0.05;
        vImg.y = uv.y * 1.2 - 0.15;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
`

export default vertexShader