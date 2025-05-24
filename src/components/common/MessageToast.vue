<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click="handleOutsideClick">
            <!-- Overlay -->
            <div class="absolute inset-0"></div>
            
            <!-- Message Box -->
            <div class="relative bg-gradient-to-br from-sky-300 to-sky-400 rounded-xl p-6 shadow-2xl border-4 border-sky-300/50 min-w-[300px]">
                <p class="text-sky-900 text-lg text-center">{{ message }}</p>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const message = ref('')

const show = (msg, duration = 2000) => {
    message.value = msg
    isOpen.value = true
    
    if (duration > 0) {
        setTimeout(() => {
            isOpen.value = false
        }, duration)
    }
}

const handleOutsideClick = () => {
    isOpen.value = false
}

defineExpose({
    show
})
</script>
