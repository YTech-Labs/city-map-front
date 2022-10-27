import { createRouter, createWebHistory } from 'vue-router';
import MapComponent from '../components/map_component.vue';
import ProfileComponent from '../components/profile_component.vue';

const routes = [
    {
        path: '/',
        name: 'Map',
        component: MapComponent,
    },
    {
        path: '/map',
        redirect: '/',
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfileComponent
    },
    
];

const router = createRouter({ 
    history: createWebHistory(),
    mode: 'history',
    routes: routes,
    linkActiveClass: "active",
    linkExactActiveClass: "exact-active",
 });

export default router;