import { createRouter, createWebHistory } from 'vue-router'

import MainMenuView from '../components/menu/MainMenu.vue'
import VsCpuMenuView from '../components/menu/VsCpuMenu.vue'
import VsPlayerMenuView from '../components/menu/VsPlayerMenu.vue'
import DeckBuilderView from '../components/menu/DeckBuilder.vue'
import GameBoardView from '../components/GameBoard.vue'

const routes = [
  {
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
          who: route.query.who,
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
          who: route.query.who,
        })
      }
    ],
  },
  {
    path: '/build',
    name: 'DeckBuilder',
    component: () => import('../components/menu/DeckBuilder.vue'),
    // children: [
    //   {
    //     path: 'create-new',
    //     name: 'CreateNewDeck',
    //     component: () => import('../components/menu/CreateNewDeck.vue')
    //   },
    //   {
    //     path: 'edit-existing',
    //     name: 'EditExistingDeck',
    //     component: () => import('../components/menu/EditExistingDeck.vue')
    //   },
    //   {
    //     path: 'prebuilds',
    //     name: 'Prebuilds',
    //     component: () => import('../components/menu/Prebuilds.vue')
    //   },
    //   {
    //     path: 'card-database',
    //     name: 'CardDatabase',
    //     component: () => import('../components/menu/CardDatabase.vue')
    //   }
    // ]
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