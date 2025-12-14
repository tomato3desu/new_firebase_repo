<script setup>
import { usePinStore } from '~/composables/stores/pin'

const { pinId } = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const config = useRuntimeConfig()

const pinStore = usePinStore()

const pin = computed(() => pinStore.pinsById[pinId])
const lat = computed(() => pin.value.latitude)
const lng = computed(() => pin.value.longitude)

const weatherData = ref(null)
const isLoading = ref(false)

const fetchWeather = async () => {
    if(!lat.value || !lng.value) return

    try {
        isLoading.value = true
        const res = await $fetch(`${config.public.weatherApiBase}/forecast.json?key=${config.public.weatherApiKey}&q=${lat.value},${lng.value}&days=${7}&aqi=no&alerts=no`)

        console.log(res)

        weatherData.value = res
    } catch (error) {
        console.error('weather api fetch error', error)
    } finally {
        isLoading.value = false
    }
}

const formatDate = (dateStr) => {
  const [, month, day] = dateStr.split('-')
  return `${month}/${day}`
}

const formatTime = (timeStr) => {
  return timeStr.split(' ')[1]
}


onMounted(async () => {
    await fetchWeather()
})

watch(
    () => pinId,
    async (newId) => {
        weatherData.value = null

        await fetchWeather()
    },
    { immediate: true }
)
</script>

<template>
    <div 
        class="text-slate-50 p-2"
    >
        <!-- loading -->
        <div v-if="isLoading">
            <p class="text-slate-50 text-center my-2">now loading ...</p>
        </div>
        <!-- weather -->
        <div v-if="weatherData">
            <div v-for="day in weatherData.forecast.forecastday" :key="day.date">
                <p class="text-2xl text-center">{{ formatDate(day.date) }}</p>
                <p>日の出:{{ day.astro.sunrise }}</p>
                <p>日の入り:{{ day.astro.sunset }}</p>
                <p>月相：{{ day.astro.moon_phase }}</p>
                <p>輝面率:{{ day.astro.moon_illumination }}</p>
                <!-- hour -->
                <div v-for="hour in day.hour" :key="hour.time_epoch">
                    <p>{{ formatTime(hour.time) }}</p>
                    <NuxtImg :src="`https:${hour.condition.icon}`" alt="icon" class="h-8 w-8"/>
                    <p>{{ hour.temp_c }}℃</p>
                </div>
            </div>
        </div>
    </div>
</template>