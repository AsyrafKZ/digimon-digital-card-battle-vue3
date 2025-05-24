<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/50"></div>

            <!-- Dialog -->
            <div
                class="relative bg-gradient-to-br from-sky-300 to-sky-400 rounded-xl p-6 shadow-2xl border-4 border-sky-300/50 w-[400px]">
                <!-- Message -->
                <p class="text-sky-900 text-lg mb-6">{{ message }}</p>

                <!-- Buttons -->
                <div class="flex justify-end gap-4">
                    <button @mouseover="playHoverSound" @click="onCancel"
                        class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-all">
                        Cancel
                    </button>
                    <button @mouseover="playHoverSound" @click="onConfirm"
                        class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md transition-all">
                        Continue
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { playHoverSound } from '../../utils/audio';

defineProps({
    isOpen: Boolean,
    message: String
})

const emit = defineEmits(['confirm', 'cancel'])

const onConfirm = () => emit('confirm')
const onCancel = () => emit('cancel')
</script>
