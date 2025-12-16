<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { usePinStore } from '~/composables/stores/pin'
import { useUserStore } from '~/composables/stores/user'

definePageMeta({
    layout: 'map',
    middleware: 'auth'
})

const authStore = useAuthStore()
const bookmarkStore = useBookmarkStore()
const pinStore = usePinStore()
const userStore = useUserStore()

const user = computed(() => authStore.loginUser)
await userStore.fetchUserIfNeeded(user.value.id)
await bookmarkStore.fetchBookmarksByUserId(user.value.id) // userのbookmarkをfetch
pinStore.displayPinsId = bookmarkStore.bookmarkedPinsByUserId[user.value.id] // displayPinsIdを変更してユーザーのお気に入りピンを表示
</script>

<template>
    <ProfileDrawer />
</template>