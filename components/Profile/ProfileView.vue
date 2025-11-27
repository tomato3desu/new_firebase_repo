<script setup>
import { usePrefStore } from '~/composables/stores/prefecture'

const { user } = defineProps({
    user: Object
})

const prefStore = usePrefStore()

onMounted(async() => {
    await prefStore.setAllPrefs()
})
</script>

<template>
    <div class="max-w-80 mx-auto mt-10 p-6 border rounded-2xl shadow overflow-y-auto">
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
            {{ prefStore.prefsById[user?.prefectureId].name }}
        </p>
    </div>
</template>