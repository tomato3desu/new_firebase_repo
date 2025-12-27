<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useAuthStore } from '~/composables/stores/auth'

const { pinId } = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const pinStore = usePinStore()
const authStore = useAuthStore()

const toast = useToast()

const pin = computed(() => pinStore.pinsById[pinId])
const lat = computed(() => pin.value.latitude)
const lng = computed(() => pin.value.longitude)

const weatherData = ref(null)
const isLoading = ref(false)

const fetchWeather = async () => {
    if (!lat.value || !lng.value) return
    if (!authStore.isLoggedIn) {
        alert('天気情報を取得するにはログインしてください')
        return
    }

    try {
        isLoading.value = true
        const token = await authStore.getIdToken()
        const res = await $fetch(`/api/weather`, {
            query: {
                lat: lat.value,
                lng: lng.value
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        weatherData.value = res
    }
    catch (error) {
        toast.error({
            title: '天気情報の取得に失敗しました。時間をおいて再度お試しください',
            message: error.message
        })
    }
    finally {
        isLoading.value = false
    }
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

const formatTime = (timeStr) => {
    const date = new Date(timeStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatMoonPhase = (mfStr) => {
    if (mfStr === 'New Moon') return '新月'
    if (mfStr === 'Waxing Crescent') return '三日月'
    if (mfStr === 'First Quarter') return '上限の月'
    if (mfStr === 'Waxing Gibbous') return '十三夜の月'
    if (mfStr === 'Full Moon') return '満月'
    if (mfStr === 'Waning Gibbous') return '更待月'
    if (mfStr === 'Third Quarter') return '下弦の月'
    return '有明月'
}

watch(
    () => pinId,
    async (newId) => {
        weatherData.value = null
    },
    { immediate: true }
)
</script>

<template>
    <div 
        class="text-slate-50 p-2"
    >
        <div class="flex justify-center my-2">
            <button
                class="bg-slate-50 text-slate-800 hover:bg-slate-300 px-2 py-1 rounded"
                @click="fetchWeather"
            >
                get weather
            </button>
        </div>
        <!-- loading -->
        <div
            v-if="isLoading"
            class="text-center"
        >
            <p class="text-slate-50 text-sm text-center my-2 animate-pulse">
                now loading ...
            </p>
        </div>
        
        <!-- weather -->
        <div
            v-if="weatherData"
            class="space-y-6"
        >
            <div
                v-for="day in weatherData.forecast.forecastday"
                :key="day.date"
                class="bg-slate-800/60 rounded-xl shadow-md p-4 space-y-3"
            >
                <p class="text-lg font-semibold text-center border-b border-slate-600 pb-2">
                    {{ formatDate(day.date) }}
                </p>
                <div class="text-sm text-slate-300 space-y-1">
                    <p>日の出：{{ day.astro.sunrise }}</p>
                    <p>日の入り：{{ day.astro.sunset }}</p>
                    <p>月相：{{ formatMoonPhase(day.astro.moon_phase) }}</p>
                    <p>輝面率：{{ day.astro.moon_illumination }}%</p>
                </div>
                <!-- hour -->
                <div class="divide-y divide-slate-700">
                    <div
                        v-for="hour in day.hour"
                        :key="hour.time_epoch"
                        class="flex items-center justify-between py-2"
                    >
                        <p class="w-16 text-sm text-slate-200">
                            {{ formatTime(hour.time) }}
                        </p>
                        <NuxtImg
                            :src="`https:${hour.condition.icon}`"
                            alt="icon"
                            class="h-8 w-8"
                        />
                        <p class="text-sm font-medium">
                            {{ hour.temp_c }}℃
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>