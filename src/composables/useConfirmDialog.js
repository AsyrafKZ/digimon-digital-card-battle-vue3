import { ref } from 'vue'
import { playCloseDialogSound, playOpenDialogSound } from '../utils/audio'

export function useConfirmDialog() {
    const isDialogOpen = ref(false)
    const dialogMessage = ref('')
    const resolvePromise = ref(null)

    const showDialog = (message) => {
        playOpenDialogSound();
        dialogMessage.value = message
        isDialogOpen.value = true
        return new Promise(resolve => {
            resolvePromise.value = resolve
        })
    }

    const handleConfirm = () => {
        playCloseDialogSound();
        isDialogOpen.value = false
        resolvePromise.value(true)
    }
    
    const handleCancel = () => {
        playCloseDialogSound();
        isDialogOpen.value = false
        resolvePromise.value(false)
    }

    return {
        isDialogOpen,
        dialogMessage,
        showDialog,
        handleConfirm,
        handleCancel
    }
}
