<script setup>
import { useUserStore } from '~/composables/stores/user'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { usePinStore } from '~/composables/stores/pin'

definePageMeta({
    layout: 'map',
    middleware: async (to) => {
        const userStore = useUserStore()

        try {
            await userStore.fetchUserIfNeeded(to.params.id)
        } catch {
            throw createError({
                statusCode: 404,
                message: 'ユーザーが存在しません'
            })
        }
    }
})

const route = useRoute()
const userStore = useUserStore()
const bookmarkStore = useBookmarkStore()
const pinStore = usePinStore()

const user = computed(() => userStore.usersById[route.params.id])
await bookmarkStore.fetchBookmarksByUserId(user.value.id) // userのbookmarkをfetch
pinStore.displayPinsId = bookmarkStore.bookmarkedPinsByUserId[user.value.id] // displayPinsIdを変更してユーザーのお気に入りピンを表示
</script>

<template>
    <ProfileDrawer />
</template>