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
        class="fixed right-0 top-16 z-40 flex"
    >
        <div class="w-4 flex items-center">
            <button
                class="text-gray-700 bg-gray-400 h-20 rounded-l-md"
                @click="close"
            >
                ▶
            </button>
        </div>
        <div class="w-60 max-w-[calc(100vw-40px)] sm:w-80 bg-white shadow-lg relative h-[calc(100vh-4rem)] px-2 overflow-y-auto">
            <div class="mt-2 mb-1">
                <div class="flex items-center">
                    <font-awesome-icon
                        icon="fa-solid fa-t"
                        class="w-4 h-4 mr-0.5"
                    />
                    <label class="block text-gray-700 text-sm font-medium">タイトル</label>
                </div>
                <input 
                    v-model="titleKeyword" 
                    type="text" 
                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="タイトル"
                >
            </div>
            <div>
                <div class="flex items-center mt-2 mb-1">
                    <font-awesome-icon
                        icon="fa-solid fa-moon"
                        class="h-4 w-4 text-gray-700 mr-0.5"
                    />
                    <label class="block text-gray-700 text-sm font-medium">暗さ</label>
                </div>
                <select 
                    v-model="minAvgDarkness"
                    class="rounded-sm focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <option
                        :value="1"
                        selected
                        class="text-gray-700"
                    >
                        -----
                    </option>
                    <option :value="1" class="text-gray-700">
                        1
                    </option>
                    <option :value="2" class="text-gray-700">
                        2
                    </option>
                    <option
                        :value="3"
                        class="text-gray-700"
                    >
                        3
                    </option>
                    <option :value="4" class="text-gray-700">
                        4
                    </option>
                    <option :value="5" class="text-gray-700">
                        5
                    </option>
                </select>
            </div>
            <div>
                <div class="flex items-center mt-2 mb-1">
                    <font-awesome-icon
                        icon="fa-solid fa-route"
                        class="h-4 w-4 text-gray-700 mr-2"
                    />
                    <label class="block text-gray-700 text-sm font-medium">アクセス</label>
                </div>
                <select 
                    v-model="minAvgAccess"
                    class="rounded-sm focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <option
                        :value="1"
                        selected
                        class="text-gray-700"
                    >
                        -----
                    </option>
                    <option :value="1" class="text-gray-700">
                        1
                    </option>
                    <option :value="2" class="text-gray-700">
                        2
                    </option>
                    <option
                        :value="3"
                        class="text-gray-700"
                    >
                        3
                    </option>
                    <option :value="4" class="text-gray-700">
                        4
                    </option>
                    <option :value="5" class="text-gray-700">
                        5
                    </option>
                </select>
            </div>
            <div v-if="prefStore.prefsById">
                <div class="flex items-center mt-2 mb-1">
                    <font-awesome-icon
                        icon="fa-solid fa-earth-asia"
                        class="w-4 h-4 text-gray-700 mr-2"
                    />
                    <label class="block text-gray-700 text-sm font-medium">都道府県</label>
                </div>
                <select
                    v-model="prefId"
                    class="rounded-sm focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <option
                        selected
                        value=""
                        class="text-gray-700"
                    >
                        -----
                    </option>
                    <option
                        v-for="pref in prefStore.prefsById"
                        :key="pref.id"
                        :value="pref.id"
                        class="text-gray-700"
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
                    class=" px-4 py-2 rounded disabled:bg-green-200  bg-green-500 text-white hover:bg-green-600 transition"
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