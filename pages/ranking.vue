<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { usePrefStore } from '~/composables/stores/prefecture'

const pinStore = usePinStore()
const prefStore = usePrefStore()

const toast = useToast()

const bookmarkRanking = computed(() => pinStore.bookmarkRanking)
const darknessRanking = computed(() => pinStore.darknessRanking)
const accessRanking = computed(() => pinStore.accessRanking)

const selectedPrefId = ref(0)

const getRanking = async (prefId) => {
    selectedPrefId.value = Number(prefId)
    if (selectedPrefId.value === 0) {
        try {
            await pinStore.fetchRankingAll()
        }
        catch (error) {
            toast.error({
                title: 'ランキング情報の取得に失敗しました。時間をおいて再度お試しください',
                message: error?.response?._data?.message
            })
        }
        return
    }

    try {
        await pinStore.fetchRankingByPrefId(selectedPrefId.value)
    }
    catch (error) {
        toast.error({
            title: 'ランキング情報の取得に失敗しました。時間をおいて再度お試しください',
            message: error?.response?._data?.message
        })
    }
}

onMounted(async () => {
    try {
        await pinStore.fetchRankingAll()
        await prefStore.setAllPrefs()
    }
    catch (error) {
        toast.error({
            title: 'ランキング情報の取得に失敗しました。時間をおいて再度お試しください',
            message: error?.response?._data?.message
        })
    }
})
</script>

<template>
    <div class="text-slate-50 bg-gradient-to-tl from-slate-900 from- via-slate-700 via- to-slate-400 to- p-6 min-h-[calc(100vh-4rem)]">
        <!-- pref -->
        <div class="flex justify-center">
            <select
                class="border p-2 rounded bg-slate-50 text-slate-800 shadow focus:outline-none focus:ring focus:ring-blue-300"
                @change="getRanking($event.target.value)"
            >
                <option value="0">
                    全国
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

        <!-- ranking -->
        <div>
            <div class="flex items-center justify-center my-4">
                <font-awesome-icon
                    icon="fa-solid fa-bookmark"
                    class=" h-8 w-8"
                />
                <p class="text-2xl ml-2">
                    ブックマーク数
                </p>
            </div>
            <div
                v-if="!bookmarkRanking || bookmarkRanking.length === 0"
                class="h-20"
            />
            <RankingCard
                v-for="pinId of bookmarkRanking"
                :key="pinId"
                :pin-id="pinId"
                :rank="pinStore.bookmarkRanking.indexOf(pinId) + 1"
            />
        </div>
        <div>
            <div class="flex items-center justify-center  my-4">
                <font-awesome-icon
                    icon="fa-solid fa-moon"
                    class="h-8 w-8"
                />
                <p class="text-2xl ml-2">
                    暗さ
                </p>
            </div>
            <div
                v-if="!darknessRanking || darknessRanking.length === 0"
                class="h-20"
            />
            <RankingCard
                v-for="pinId of darknessRanking"
                :key="pinId"
                :pin-id="pinId"
                :rank="pinStore.darknessRanking.indexOf(pinId) + 1"
            />
        </div>
        <div>
            <div class="flex items-center justify-center  my-4">
                <font-awesome-icon
                    icon="fa-solid fa-route"
                    class="h-8 w-8"
                />
                <p class="text-2xl ml-2">
                    アクセス
                </p>
            </div>
            <div
                v-if="!accessRanking || accessRanking.length === 0"
                class="h-20"
            />
            <RankingCard
                v-for="pinId of accessRanking"
                :key="pinId"
                :pin-id="pinId"
                :rank="pinStore.accessRanking.indexOf(pinId) + 1"
            />
        </div>
    </div>
</template>