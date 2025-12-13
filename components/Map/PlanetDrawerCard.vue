<script setup>
import { usePinStore } from '~/composables/stores/pin'

const { pinId } = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const pinStore = usePinStore()

const config = useRuntimeConfig()

const pin = computed(() => pinStore.pinsById[pinId])
const lat = computed(() => pin.value.latitude)
const lng = computed(() => pin.value.longitude)

const date = ref(null)
const time = ref(null)
const hour = ref(null)
const min = ref(null)

const stars = ref([])

const isOpenPlanetInfoDialong = ref(false)
const selectedStar = ref(null)

const fetchPlanets = async () => {
    stars.value = []
    console.log(date.value)
    console.log(hour.value)
    console.log(min.value)
    console.log(lat.value)
    console.log(lng.value)
    if (!date.value || !hour.value || !min.value || !lat.value || !lng.value) return

    try {
        const res = await $fetch(`${config.public.livlogApiBase}/constellation?lat=${lat.value}&lng=${lng.value}&date=${date.value}&hour=${hour.value}&min=${min.value}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${config.public.livlogApiKey}`,
            }
        })

        stars.value = []
        console.log(res)
        for (const star of res.results) {
            console.log(star)
            stars.value.push(star)
        }
    }
    catch (error) {
        console.error('livlog api fetch error', error)
    }
}

const openPlanetInfo = (star) => {
    selectedStar.value = star
    isOpenPlanetInfoDialong.value = true
}

/* time(HH:MM) → hour / min に分解 */
watch(time, (value) => {
    if (!value) return
    const [h, m] = value.split(':')
    hour.value = Number(h)
    min.value = Number(m)
})

watch(
    () => pinId,
    () => {
        // 検索条件
        date.value = null
        time.value = null
        hour.value = null
        min.value = null

        // 結果
        stars.value = []

        // dialog
        selectedStar.value = null
        isOpenPlanetInfoDialong.value = false
    },
    { immediate: true }
)
</script>

<template>
    <div class="text-slate-50 p-2">
        <!-- 検索box -->
        <div>
            <div class="mt-2 mb-1">
                <div class="flex items-center">
                    <font-awesome-icon
                        icon="fa-solid fa-calendar-days"
                        class="w-4 h-4 mr-0.5"
                    />
                    <label class="block text-sm font-medium">date</label>
                </div>
                <input
                    v-model="date"
                    type="date"
                    class="text-slate-800 bg-slate-50 w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
                >
            </div>
            <div class="mt-2 mb-1">
                <div class="flex items-center">
                    <font-awesome-icon
                        icon="fa-solid fa-clock"
                        class="w-4 h-4 mr-0.5"
                    />
                    <label class="block text-sm font-medium">time</label>
                </div>
                <input
                    v-model="time"
                    type="time"
                    class="text-slate-800 bg-slate-50 w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
                >
            </div>
            <div class="flex items-center justify-center my-4">
                <button
                    class="text-slate-800 bg-slate-50 hover:bg-slate-300 rounded-md text-center px-2 py-1 font-medium"
                    @click="fetchPlanets"
                >
                    get
                </button>
            </div>
        </div>
        <div v-if="stars">
            <div 
                v-for="star in stars"
                :key="star.id"
                class="h-20 border text-slate-50 border-slate-500 rounded-md bg-cover bg-center"
                :style="{ backgroundImage: `url(${star.starIcon})` }"
                @click="openPlanetInfo(star)"
            >
                <p class="m-2">
                    {{ star.jpName }}
                </p>
            </div>
        </div>
        <MapPlanetInfoDialog
            v-model="isOpenPlanetInfoDialong"
            :star="selectedStar"
        />
    </div>
</template>