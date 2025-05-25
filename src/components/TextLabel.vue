<template>
    <div ref="htmlContent" :style="styleObject" class="css2d-label">
        <!-- Allow passing text/HTML content via slots -->
        <slot></slot> 
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, toRefs, inject, useSlots, shallowRef } from "vue";
import { CSS2DObject } from "/node_modules/three/examples/jsm/renderers/CSS2DRenderer.js"

const props = defineProps({
    position: {
        type: Object,
        default: () => ({ x: 1, y: 0, z: 0 }),
    },
    // optional: direct text prop
    text: {
        type: String,
        default: "",
    },
    // optional: for identifying the object in the scene
    name: {
        type: String,
        default: "",
    }
})

const { position, text, name } = toRefs(props);
const htmlContent = ref(null); // ref to the root div of this component
const css2DObjectInstance = shallowRef(null); // use shallowRef for the Three.js object
const injectedSceneRef = inject("threeScene"); // inject the Three.js scene from GameBoard.vue
console.log("injected initial threeScene")
const slots = useSlots(); // to get the content passed into the <slot>

function setupObject(actualScene) {
    if (!htmlContent.value || !actualScene) {
        console.error("TextLabel: htmlContent ref or actualScene not available");
        return;
    }

    const newCSS2DObject = new CSS2DObject(htmlContent.value);
    newCSS2DObject.position.set(position.value.x, position.value.y, position.value.z);
    if (name.value) {
        newCSS2DObject.name = name.value;
    }
    
    actualScene.add(newCSS2DObject);
    css2DObjectInstance.value = newCSS2DObject;

    // if text prop is used directly, set it initially
    if (text.value && !slots.default) {
        htmlContent.value.innerHTML = text.value;
    }

    // attach self (CSS2DObject) to the mesh that matches the id prop
    // so that when the mesh moves, the text follows
    const slotProps = slots["default"]()[0].props;
    if (slotProps && slotProps.id) {
        const sceneObjects = actualScene.children
        const id = slotProps.id;
        const playerActiveFieldLabels = ["pDpCount", "pActiveNm", "pActiveC", "pActiveT", "pActiveX", "pActiveXEff", "pActiveHpLbl", "pActiveHp"]
        const opponentActiveFieldLabels = ["oDpCount", "oActiveNm", "oActiveC", "oActiveT", "oActiveX", "oActiveXEff", "oActiveHpLbl", "oActiveHp"]
        const playerChoiceLabels = ["pChoiceName", "pChoiceHp", "pChoiceLevel", "pChoiceSp", "pChoiceONm", "pChoiceTNm", "pChoiceXNm", "pChoiceXEff", "pChoiceOVal", "pChoiceTVal", "pChoiceXVal", "pChoiceXSpd", "pChoiceTurn"]
        const opponentChoiceLabels = ["oChoiceName", "oChoiceHp", "oChoiceLevel", "oChoiceSp", "oChoiceONm", "oChoiceTNm", "oChoiceXNm", "oChoiceXEff", "oChoiceOVal", "oChoiceTVal", "oChoiceXVal", "oChoiceXSpd", "oChoiceTurn"]
        const playerChoiceHoverLabels = ["choiceOHover", "choiceTHover", "choiceXHover"]
        const infoBoardLabels = ["infoNm", "infoHp", "infoOVal", "infoTVal", "infoXVal", "infoXEff", "infoXSpd", "infoLevel", "infoSp", "infoDp", "infoPp", "infoSupport", "infoSupportSpd"]
        
        if (playerActiveFieldLabels.includes(id)) {
            const pAFieldMesh = sceneObjects.find(obj => obj.name === "pAField");
            pAFieldMesh.attach(css2DObjectInstance.value);
        } else if (opponentActiveFieldLabels.includes(id)) {
            const oAFieldMesh = sceneObjects.find(obj => obj.name === "oAField");
            oAFieldMesh.attach(css2DObjectInstance.value);
        } else if (playerChoiceLabels.includes(id) || playerChoiceHoverLabels.includes(id)) {
            const pChoiceMesh = sceneObjects.find(obj => obj.name === "pChoice");
            pChoiceMesh.attach(css2DObjectInstance.value);
        } else if (opponentChoiceLabels.includes(id)) {
            const oChoiceMesh = sceneObjects.find(obj => obj.name === "oChoice");
            oChoiceMesh.attach(css2DObjectInstance.value);
        } else if (infoBoardLabels.includes(id)) {
            const infoBoardMesh = sceneObjects.find(obj => obj.name === "infoBoard");
            infoBoardMesh.attach(css2DObjectInstance.value);
        }
    }
}

onMounted(() => {
    // If scene is already available when child mounts (less likely but possible)
    if (injectedSceneRef.value) {
        setupObject(injectedSceneRef.value);
    }

    // watch for scene to become available
    const unwatch = watch(injectedSceneRef, (newScene) => {
        if (newScene && !css2DObjectInstance.value) { // ensure setup happens only once
            setupObject(newScene);
            // unwatch once the scene is set up
            unwatch();
        } else if (!newScene && css2DObjectInstance.value) {
            // scene became unavailable, remove the object
            if (css2DObjectInstance.value.parent) {
                css2DObjectInstance.value.parent.remove(css2DObjectInstance.value);
            }
            css2DObjectInstance.value = null;
        }
    }, { immediate: false }); // `immediate: true` is default, set to true to try setup immediately

    // make sure to stop watching if component unmounts
    onBeforeUnmount(() => {
        unwatch();
        if (css2DObjectInstance.value && injectedSceneRef.value) {
            injectedSceneRef.value.remove(css2DObjectInstance.value);
        }
        css2DObjectInstance.value = null;
    })
})

onBeforeUnmount(() => {
    // the actual Three.js object cleanup should happen based on css2DObjectInstance.value and injectedSceneRef.value being valid
    // The watcher's cleanup for !newScene handles the case where the scene itself is nulled out.
    // Redundant cleanup here might be fine, or consolidate.
    if (css2DObjectInstance.value) {
        if (injectedSceneRef.value) { // Check if scene still exists
            injectedSceneRef.value.remove(css2DObjectInstance.value);
        }
        // Dispose logic...
        css2DObjectInstance.value = null;
    }
})

// watch for prop changes to update the CSS2DObject
watch(position, (newPos) => {
    if (css2DObjectInstance.value) {
        css2DObjectInstance.value.position.set(newPos.x, newPos.y, newPos.z);
    }
}, { deep: true })

// if text prop is used and changes, update innerHTML
watch(text, (newText) => {
    if (css2DObjectInstance.value && htmlContent.value && !slots.default) {
        htmlContent.value.innerHTML = newText;
    }
})

// style for the div that CSS2DObject will manage
const styleObject = {
    // color: "white",
    // fontSize: "20px",
    // fontFamily: "Arial, sans-serif",
    // fontWeight: "bold",
    // textAlign: "center",
    // textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
    // pointerEvents: "auto", // to make the label interactive
}

</script>

<style scoped>

.css2d-label {
    /* default styling for labels here */
}

</style>
