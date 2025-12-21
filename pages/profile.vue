<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { usePinStore } from '~/composables/stores/pin'
import { useUserStore } from '~/composables/stores/user'

definePageMeta({
    middleware: 'auth'
})

const authStore = useAuthStore()
const bookmarkStore = useBookmarkStore()
const pinStore = usePinStore()
const userStore = useUserStore()

const user = computed(() => authStore.loginUser)
try {
    await userStore.fetchUserIfNeeded(user.value.id)
    await bookmarkStore.fetchBookmarksByUserId(user.value.id) // userのbookmarkをfetch
    pinStore.displayPinsId = [...bookmarkStore.bookmarkedPinsByUserId[user.value.id]] // displayPinsIdを変更してユーザーのお気に入りピンを表示
}
catch (error) {
    toast.error({
        title: 'ユーザー情報の取得に失敗しました。時間をおいて再度お試しください',
        message: error.message
    })
}
</script>

<template>
    <ProfileDrawer />
</template>