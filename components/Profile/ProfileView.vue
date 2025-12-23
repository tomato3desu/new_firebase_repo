<script setup>
import { usePrefStore } from '~/composables/stores/prefecture'
import { useBookmarkStore } from '~/composables/stores/bookmark'

const { user } = defineProps({
    user: Object
})

const prefStore = usePrefStore()
const bookmarkStore = useBookmarkStore()

const isOpenUserReportDialog = ref(false)

const onReportClicked = () => {
    isOpenUserReportDialog.value = true
}

onMounted(async () => {
    try {
        await prefStore.setAllPrefs()
        await bookmarkStore.fetchBookmarksByUserId(user?.id)
    }
    catch (error) {
        toast.error({
            title: 'ユーザー情報の取得に失敗しました。時間をおいて再度お試しください',
            message: error?.response?._data?.message
        })
    }
})
</script>

<template>
    <div class="max-w-[calc(100vw-20px)] mx-auto mt-10 p-6 text-slate-50 border border-slate-500 rounded-2xl shadow overflow-y-auto bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to-">
        <NuxtImg
            :src="user?.iconImagePath || '/images/default_user.jpeg'"
            class="w-32 h-32 object-cover rounded-sm mb-4 mx-auto"
        />
        <div class="flex items-center">
            <p class="text-xl font-bold">
                {{ user?.nickname }}
            </p>
            <font-awesome-icon
                icon="fa-solid fa-triangle-exclamation"
                class="w-6 h-6 ml-auto cursor-pointer hover:text-yellow-300"
                @click="onReportClicked"
            />
        </div>
        <p class="">
            {{ user?.comment }}
        </p>
        <p class="mx-auto">
            {{ prefStore.prefsById[user?.prefectureId]?.name }}
        </p>
    </div>
    <ProfileUserReportDialog
        v-if="user"
        v-model="isOpenUserReportDialog"
        :user-id="user.id"
    />
</template>