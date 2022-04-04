import PenView from '@/views/PenView.vue'
import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue';

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        title: 'Codepen Clone'
      },
      component: HomeView
    },
    {
      path: '/pen',
      name: 'PenDetails',
      meta: {
        title: 'Edit Pen'
      },
      component: PenView
    }
  ]
})
const DEFAULT_TITLE = 'Codepen Clone';
router.afterEach((to, from) => {
    // Use next tick to handle router history correctly
    // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
    Vue.nextTick(() => {
        document.title = to.meta?.title || DEFAULT_TITLE;
    });
});

export default router
