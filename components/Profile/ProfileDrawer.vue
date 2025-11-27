<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/composables/stores/auth'
import { useUserStore } from '~/composables/stores/user'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { usePinStore } from '~/composables/stores/pin'

const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()
const bookmarkStore = useBookmarkStore()
const pinStore = usePinStore()

const isOpen = ref(true)

const mode = computed(() => {
    if (route.path === '/profile') return 'edit'
    if (route.params.id) return 'view'
    return null
})

const targetUserId = computed(() => {
    return mode.value === 'edit'
        ? authStore.loginUser?.id
        : route.params.id
})

watch(
    () => targetUserId.value,
    async (id) => {
        if (id) {
            await userStore.fetchUserIfNeeded(id) // userをfetch
            await bookmarkStore.fetchBookmarksByUserId(id) // userのbookmarkをfetch
            pinStore.displayPinsId = bookmarkStore.bookmarkedPinsByUserId[id] // displayPinsIdを変更してユーザーのお気に入りピンを表示
            isOpen.value = true
        }
    },
    { immediate: true }
)
</script>

<template>
    <div v-if="mode">
        <!-- Drawer本体 -->
        <div
            class="fixed top-0 right-0 h-full bg-white shadow-xl z-40 transition-all duration-300"
            :class="isOpen ? 'w-96' : 'w-0'"
        >
            <!-- Drawer 中身（閉じてるときは非表示） -->
            <div v-if="isOpen" class="h-full overflow-y-auto p-4">
                <ProfileEdit
                    v-if="mode === 'edit'"
                    :user="authStore.loginUser"
                />
                <ProfileView
                    v-if="mode === 'view'"
                    :user="userStore.usersById[targetUserId]"
                />
            </div>

            <!-- スライドボタン：Drawerの左端に配置 → 一緒に動く -->
            <button
                class="absolute top-1/2 -left-4 h-20 z-40 bg-gray-400 text-gray-700 
                       flex justify-center items-center rounded-l-lg hover:bg-gray-500 transition-all duration-300"
                @click="isOpen = !isOpen"
            >
                {{ isOpen ? '▶' : '◀' }}
            </button>
        </div>
    </div>
</template>