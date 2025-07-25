// import the necessary function from Vue (which is wrapped with troisjs own functions)
import { createApp } from 'troisjs'
// my root Vue component
// this is the top level component that contains everything else (headers, footers, router views, etc)
import App from './App.vue' 

// import and set up Pinia (state management)
import { createPinia } from 'pinia'
import { useLocalStateStore } from './stores/localState'
import { useGameDataStore } from './stores/gameData'
// import and set up Vue router
import router from './router'
// import tresjs
import Tres from "@tresjs/core"

// create an instance of the Vue application
const app = createApp(App)

// add plugins
app.use(router)
app.use(createPinia())
app.use(Tres)

// initialize Pinia stores
// const gameDataStore = useGameDataStore()
// await gameDataStore.init()
// const localStateStore = useLocalStateStore()
// await localStateStore.init()


// this tells Vue to take the application instance (rooted by App.vue)
// and render its output into the HTML element with the ID app
app.mount('#app')