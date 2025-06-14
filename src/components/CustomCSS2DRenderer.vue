<template>
    <slot />
</template>

<script setup>
import { CSS2DRenderer } from 'three/examples/jsm/Addons.js';
import { onMounted, watch, watchEffect } from 'vue';
import { useLoop } from "@tresjs/core";
import { Clock } from 'three';

const props = defineProps(["width", "height", "canvasFrameC"]);

// onMounted(() => {
//     const htmlRenderer = new CSS2DRenderer();
//     // set size based on the canvasFrameC element
//     // console.log("canvasFrameC", canvasFrameC)
//     // const frameRect = canvasFrameC.getBoundingClient()
//     // const width1 = frameRect.width
//     // const height1 = frameRect.height
//     // console.log("width", width1, "height", height1)
//     // htmlRenderer.setSize(width1, height1);
//     htmlRenderer.domElement.id = "htmlRenderer";
//     htmlRenderer.domElement.style.position = "absolute";
//     htmlRenderer.domElement.style.top = "0px";
//     htmlRenderer.domElement.style.left = "0px"; // this would not align with our canvas because canvas is in flex layout
//     htmlRenderer.domElement.style.pointerEvents = "none"; // crucial
//     htmlRenderer.name = "htmlRenderer";

//     // append the CSS2DRenderer's DOM to the canvasFrame
//     canvasFrameC.appendChild(htmlRenderer.domElement);

//     const { onAfterRender } = useLoop();

//     onAfterRender(({ scene: tresScene, camera: tresCamera }) => {
//         if (htmlRenderer && tresScene && tresCamera) {
//             // render the CSS2D objects
//             htmlRenderer.render(tresScene, tresCamera);
//         }
//     })
//     console.log("onAfterRender setting finished")
// })

const htmlRenderer = new CSS2DRenderer();
const clock = new Clock();
onMounted(() => {
    console.log("onMounted: custom css2drenderer mounted...")
    console.log("onMounted: props width and height", props.width, props.height)
    htmlRenderer.domElement.id = "htmlRenderer";
    htmlRenderer.domElement.style.position = "absolute";
    htmlRenderer.domElement.style.top = "0px";
    htmlRenderer.domElement.style.left = "0px"; // this would not align with our canvas because canvas is in flex layout
    htmlRenderer.domElement.style.pointerEvents = "none"; // crucial
    htmlRenderer.name = "htmlRenderer";
    props.canvasFrameC.appendChild(htmlRenderer.domElement);

    const { onAfterRender } = useLoop();

    onAfterRender(({ scene: tresScene, camera: tresCamera }) => {
        if (htmlRenderer && tresScene && tresCamera) {
            // render the CSS2D objects
            htmlRenderer.render(tresScene, tresCamera);
        }
        const delta = clock.getDelta()
        if (delta > 0.016) { // If frame takes longer than 16ms (60fps)
            console.warn('Frame drop detected:', delta)
        }
    })
})

watchEffect(() => {
    console.log("watchEffect: width and height changed", props.width, props.height)
})

watch([() => props.width, () => props.height], ([newWidth, newHeight]) => {
    
    
    console.log("watch: props width or height changed", newWidth, newHeight)
    htmlRenderer.setSize(newWidth, newHeight);
    
    console.log("set size to", newWidth, newHeight)
}, { once: true })

</script>

