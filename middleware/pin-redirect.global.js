export default defineNuxtRouteMiddleware((to) => {
    if (to.path.startsWith('/pin/')) {
        const pinId = to.params.id
        return navigateTo({ path: '/', query: { pinId } })
    }
})