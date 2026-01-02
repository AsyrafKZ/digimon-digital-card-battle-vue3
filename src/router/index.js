import { createRouter, createWebHistory } from 'vue-router'

import MainMenuView from '../components/menu/MainMenu.vue'
import VsCpuMenuView from '../components/menu/VsCpuMenu.vue'
import VsPlayerMenuView from '../components/menu/VsPlayerMenu.vue'
import DeckBuilderView from '../components/menu/DeckBuilder.vue'
import GameBoardView from '../components/GameBoard.vue'

const routes = [
  {
    // homepage
    path: '/',
    name: 'MainMenu',
    component: MainMenuView
  },
  {
    path: '/play/cpu',
    children: [
      {
        path: '',
        name: 'VsCpuMenu', 
        component: VsCpuMenuView,
      },
      {
        path: 'select',
        name: 'CpuDeckSelect',
        component: DeckBuilderView,
        props: (route) => ({
          player: route.query.player,
        })
      },
      {
        path: 'game',
        name: 'VsCpuGame',
        component: GameBoardView,
      }
    ]
  },
  {
    path: '/play/online',
    children: [
      {
        path: '',
        name: 'VsPlayerMenu',
        component: VsPlayerMenuView,
      },
      {
        path: 'select',
        name: 'PlayerDeckSelect',
        component: DeckBuilderView,
        props: (route) => ({
          player: route.query.player,
        })
      }
    ],
  },
  {
    path: '/build',
    name: 'DeckBuilder',
    component: () => import('../components/menu/DeckBuilder.vue'),
  },   
  {
    path: '/build/deck',
    name: 'EditDeck',
    component: () => import('../components/menu/EditDeck.vue'),
    props: (route) => ({
      id: route.query.id,
      isNewDeck: route.query.isNewDeck
    })
  },  
  {
    path: '/settings',
    name: 'Settings', 
    component: () => import('../components/menu/Settings.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})