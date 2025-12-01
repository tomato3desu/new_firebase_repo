<script setup>
import { usePrefStore } from '~/composables/stores/prefecture'
import { usePinStore } from '~/composables/stores/pin'

const emits = defineEmits(['result-clicked'])

const prefStore = usePrefStore()
const pinStore = usePinStore()

const isOpen = defineModel()
const titleKeyword = ref('')
const minAvgDarkness = ref(null)
const minAvgAccess = ref(null)
const prefId = ref(null)

const searchResultPinIds = ref([])

/**
 * pinを検索
 */
const searchPins = async () => {
    if (!titleKeyword.value && !minAvgDarkness.value && !minAvgAccess.value && !prefId.value) return
    console.log("検索前", pinStore.displayPinsId)
    const res = await pinStore.searchPins(titleKeyword.value, minAvgDarkness.value, minAvgAccess.value, prefId.value)
    console.log("検索後", pinStore.displayPinsId)
    searchResultPinIds.value = res
}

/**
 * 検索条件をclear
 */
const clearResult = () => {
    pinStore.clearDisplayPinsId()
    searchResultPinIds.value = []
}

/**
 * 検索結果のクリックされた座標をdefaultmapにemit
 * @param param0 
 */
const onResultClicked = ({ latitude, longitude }) => {
    emits('result-clicked', {
        latitude: latitude,
        longitude: longitude
    })
}

const close = () => {
    isOpen.value = false
}

onMounted(async () => {
    await prefStore.setAllPrefs()
})
</script>

<template>
    <div 
        v-if="isOpen"
        class="fixed right-0 top-16 z-40 flex "
    >
        <div class="w-4 flex items-center">
            <button
                class="text-gray-700 bg-gray-400 h-20 rounded-l-md"
                @click="close"
            >
                ▶
            </button>
        </div>
        <div class="w-80 sm:w-[calc(max-28px)] bg-white shadow-lg relative h-[calc(100vh-4rem)] overflow-y-auto">
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-1">タイトル</label>
                <input 
                    v-model="titleKeyword" 
                    type="text" 
                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="タイトル"
                >
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-1">平均暗さレベル</label>
                <select v-model="minAvgDarkness">
                    <option
                        :value="1"
                        selected
                    >
                        未選択
                    </option>
                    <option :value="1">
                        1
                    </option>
                    <option :value="2">
                        2
                    </option>
                    <option
                        :value="3"
                    >
                        3
                    </option>
                    <option :value="4">
                        4
                    </option>
                    <option :value="5">
                        5
                    </option>
                </select>
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-1">アクセス</label>
                <select v-model="minAvgAccess">
                    <option
                        :value="1"
                        selected
                    >
                        未選択
                    </option>
                    <option :value="1">
                        1
                    </option>
                    <option :value="2">
                        2
                    </option>
                    <option
                        :value="3"
                    >
                        3
                    </option>
                    <option :value="4">
                        4
                    </option>
                    <option :value="5">
                        5
                    </option>
                </select>
            </div>
            <div v-if="prefStore.prefsById">
                <select v-model="prefId">
                    <option
                        disabled
                        selected
                    >
                        未選択
                    </option>
                    <option
                        v-for="pref in prefStore.prefsById"
                        :key="pref.id"
                        :value="pref.id"
                    >
                        {{ pref.name }}
                    </option>
                </select>
            </div>
            <div>
                <button 
                    class="px-4 py-2 rounded disabled:bg-blue-200  bg-blue-500 text-white hover:bg-blue-600 transition"
                    @click="searchPins"
                >
                    search
                </button>
                <button
                    class="px-4 py-2 rounded disabled:bg-green-200  bg-green-500 text-white hover:bg-green-600 transition"
                    @click="clearResult"
                >
                    clear
                </button>
            </div>
            <!-- 検索結果を表示 -->
            <div v-if="searchResultPinIds">
                <div
                    v-for="pinId in searchResultPinIds"
                    :key="pinId"
                >
                    <MapSearchResultCard
                        :pin-id="pinId"
                        @result-clicked="onResultClicked"
                    />
                </div>
            </div>
            <div v-else>
                <p>検索結果なし</p>
            </div>
        </div>
    </div>
</template>