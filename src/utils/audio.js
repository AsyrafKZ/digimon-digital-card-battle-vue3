export const playReturnClickSound = () => {
    const sound = new Audio('/src/assets/sfx/return.mp3')
    sound.volume = 0.1
    sound.play()
}

export const playSelectClickSound = () => {
    const sound = new Audio('/src/assets/sfx/select.mp3')
    sound.volume = 0.1
    sound.play()
}
export const playHoverSound = () => {
    const sound = new Audio('/src/assets/sfx/quick-bubble-pop.mp3')
    sound.volume = 0.1
    sound.play()
}

export const playOpenDialogSound = () => {
    const sound = new Audio('/src/assets/sfx/window-open.mp3')
    sound.volume = 0.1
    sound.play()
}
export const playCloseDialogSound = () => {
    const sound = new Audio('/src/assets/sfx/window-close.mp3')
    sound.volume = 0.1
    sound.play()
}