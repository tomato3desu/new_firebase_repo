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

const user = computed(() => userStore.usersById[targetUserId.value])
const bookmarks = computed(() => bookmarkStore.bookmarkedPinsByUserId[targetUserId.value])
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

watch(() => bookmarks.value,
    (newBookmarks) => {
        if (!newBookmarks) return
        pinStore.displayPinsId = [...newBookmarks] // displayPinsIdを変更してユーザーのお気に入りピンを表示
    }
)
</script>

<template>
    <div v-if="mode">
        <!-- Drawer本体 -->
        <div
            class="max-w-[calc(100vw-20px)] fixed top-0 right-0 h-full shadow-xl z-40 transition-all duration-300"
            :class="isOpen ? 'w-80' : 'w-0'"
        >
            <div class="h-6" />
            <!-- Drawer 中身（閉じてるときは非表示） -->
            <div
                v-if="isOpen"
                class="h-full overflow-y-auto p-4"
            >
                <ProfileEdit
                    v-if="mode === 'edit'"
                    :user="authStore.loginUser"
                />
                <ProfileView
                    v-if="mode === 'view'"
                    :user="userStore.usersById[targetUserId]"
                />
                <div 
                    v-for="pinId in bookmarks" 
                    :key="pinId"
                >
                    <MapSearchResultCard
                        :pin-id="pinId"
                    />
                </div>
            </div>

            <!-- スライドボタン：Drawerの左端に配置 → 一緒に動く -->
            <button
                class="absolute top-1/2 -left-4 h-20 z-40 bg-slate-300 text-slate-800 
                       flex justify-center items-center rounded-l-lg hover:bg-slate-500 transition-all duration-300"
                @click="isOpen = !isOpen"
            >
                {{ isOpen ? '▶' : '◀' }}
            </button>
        </div>
    </div>
</template>