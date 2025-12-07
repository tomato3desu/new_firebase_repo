<script setup>
import { usePrefStore } from '~/composables/stores/prefecture'
import { useBookmarkStore } from '~/composables/stores/bookmark'

const emits = defineEmits(['move-clicked'])

const { user } = defineProps({
    user: Object
})

const prefStore = usePrefStore()
const bookmarkStore = useBookmarkStore()

const bookmarks = computed(() => bookmarkStore.bookmarkedPinsByUserId[user?.id])

const isOpenUserReportDialog = ref(false)

const onReportClicked = () => {
    isOpenUserReportDialog.value = true
}

const onMoveClicked = ({ latitude, longitude }) => {
    emits('move-clicked', {
        latitude: latitude,
        longitude: longitude
    })
}

onMounted(async () => {
    await prefStore.setAllPrefs()
    await bookmarkStore.fetchBookmarksByUserId(user?.id)
})
</script>

<template>
    <div class="w-80 max-w-[calc(100vw-20px)] mx-auto mt-10 p-6 border rounded-2xl shadow overflow-y-auto bg-white">
        <NuxtImg
            :src="user?.iconImagePath || '/images/default_user.jpeg'"
            class="w-32 h-32 object-cover rounded-sm mb-4"
        />
        <p class="text-xl font-bold">
            {{ user?.nickname }}
        </p>
        <p class="text-gray-600">
            {{ user?.comment }}
        </p>
        <p class="text-gray-600">
            {{ prefStore.prefsById[user?.prefectureId]?.name }}
        </p>
        <font-awesome-icon 
            icon="fa-solid fa-triangle-exclamation" 
            class="w-6 h-6 text-gray-700"
            @click="onReportClicked"
        />
    </div>
    <div 
        v-for="pinId in bookmarks" 
        :key="pinId"
    >
        <MapSearchResultCard
            :pin-id="pinId"
            @result-clicked="onMoveClicked"
        />
    </div>
    <ProfileUserReportDialog
        v-if="user"
        v-model="isOpenUserReportDialog"
        :user-id="user.id"
    />
</template>