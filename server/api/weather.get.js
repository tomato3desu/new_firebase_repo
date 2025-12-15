export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const query = getQuery(event)
    const { lat, lng } = query

    if (!lat || !lng) {
        throw createError({
            statusCode: 400,
            statusMessage: 'lat and lng are required'
        })
    }

    const res = await $fetch(`${config.weatherApiBase}/forecast.json`, {
        query: {
            key: config.weatherApiKey,
            q: `${lat},${lng}`,
            days: 7,
            api: 'no',
            alerts: 'no'
        }
    })

    return res
})