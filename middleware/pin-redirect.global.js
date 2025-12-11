export default defineNuxtRouteMiddleware((to) => {
    if (to.path.startsWith('/pin/')) {
        const pinId = to.params.id
        const reviewId = to.query.reviewId
        return navigateTo({ path: '/', query: { pinId, reviewId } })
    }
})