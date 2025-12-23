<script setup>
import { usePrefStore } from '~/composables/stores/prefecture'
import { usePinStore } from '~/composables/stores/pin'

const prefStore = usePrefStore()
const pinStore = usePinStore()

const toast = useToast()

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
    try {
        const res = await pinStore.searchPins(titleKeyword.value, minAvgDarkness.value, minAvgAccess.value, prefId.value)
        searchResultPinIds.value = res
    }
    catch (error) {
        toast.error({
            title: '検索に失敗しました。時間を置いて再度お試しください',
            message: error?.response?._data?.message
        })
    }
}

/**
 * 検索条件をclear
 */
const clearResult = () => {
    pinStore.clearDisplayPinsId()
    searchResultPinIds.value = []
}

const close = () => {
    isOpen.value = false
}

onMounted(async () => {
    try {
        await prefStore.setAllPrefs()
    }
    catch (error) {
        toast.error({
            title: '都道府県情報の取得に失敗しました。時間を置いて再度お試しください',
            message: error?.response?._data?.message
        })
    }
})
</script>

<template>
    <div 
        v-if="isOpen"
        class="fixed right-0 top-16 z-40 flex"
    >
        <div class="w-4 flex items-center">
            <button
                class="text-slate-900 bg-slate-300 hover:bg-slate-500 h-20 rounded-l-md"
                @click="close"
            >
                ▶
            </button>
        </div>
        <div class="w-60 max-w-[calc(100vw-40px)] sm:w-80 text-slate-50 bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to- shadow-lg relative h-[calc(100vh-4rem)] p-2 overflow-y-auto">
            <div class="mt-2 mb-1">
                <div class="flex items-center">
                    <font-awesome-icon
                        icon="fa-solid fa-t"
                        class="w-4 h-4 mr-0.5"
                    />
                    <label class="block text-sm font-medium">タイトル</label>
                </div>
                <input 
                    v-model="titleKeyword" 
                    type="text" 
                    class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="タイトル"
                >
            </div>
            <div>
                <div class="flex items-center mt-2 mb-1">
                    <font-awesome-icon
                        icon="fa-solid fa-moon"
                        class="h-4 w-4 mr-0.5"
                    />
                    <label class="block text-sm font-medium">暗さ</label>
                </div>
                <select 
                    v-model="minAvgDarkness"
                    class="rounded-sm focus:outline-none focus:ring focus:ring-blue-300 text-slate-800"
                >
                    <option
                        :value="1"
                        selected
                    >
                        -----
                    </option>
                    <option
                        :value="1"
                    >
                        1
                    </option>
                    <option
                        :value="2"
                    >
                        2
                    </option>
                    <option
                        :value="3"
                    >
                        3
                    </option>
                    <option
                        :value="4"
                    >
                        4
                    </option>
                    <option
                        :value="5"
                    >
                        5
                    </option>
                </select>
            </div>
            <div>
                <div class="flex items-center mt-2 mb-1">
                    <font-awesome-icon
                        icon="fa-solid fa-route"
                        class="h-4 w-4 mr-2"
                    />
                    <label class="block text-sm font-medium">アクセス</label>
                </div>
                <select 
                    v-model="minAvgAccess"
                    class="rounded-sm focus:outline-none focus:ring focus:ring-blue-300 text-slate-800"
                >
                    <option
                        :value="1"
                        selected
                    >
                        -----
                    </option>
                    <option
                        :value="1"
                    >
                        1
                    </option>
                    <option
                        :value="2"
                    >
                        2
                    </option>
                    <option
                        :value="3"
                    >
                        3
                    </option>
                    <option
                        :value="4"
                    >
                        4
                    </option>
                    <option
                        :value="5"
                    >
                        5
                    </option>
                </select>
            </div>
            <div v-if="prefStore.prefsById">
                <div class="flex items-center mt-2 mb-1">
                    <font-awesome-icon
                        icon="fa-solid fa-earth-asia"
                        class="w-4 h-4 mr-2"
                    />
                    <label class="block text-sm font-medium">都道府県</label>
                </div>
                <select
                    v-model="prefId"
                    class="rounded-sm focus:outline-none focus:ring focus:ring-blue-300 text-slate-800"
                >
                    <option
                        selected
                        value=""
                    >
                        -----
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
            <div class="mt-2">
                <button 
                    class="px-4 py-2 rounded disabled:bg-blue-200  bg-blue-400 hover:bg-blue-500 transition"
                    @click="searchPins"
                >
                    search
                </button>
                <button
                    class=" px-4 py-2 rounded disabled:bg-teal-200  bg-teal-400 hover:bg-teal-500 transition"
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
                    />
                </div>
            </div>
            <div v-else>
                <p>検索結果なし</p>
            </div>
        </div>
    </div>
</template>