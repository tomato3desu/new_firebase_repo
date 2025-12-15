export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const query = getQuery(event)
    const { lat, lng, date, hour, min } = query

    if (!lat || !lng || !date || !hour || !min) {
        throw createError({
            statusCode: 400,
            statusMessage: 'lat, lng, date, hour, min are required'
        })
    }

    const res = await $fetch(`${config.livlogApiBase}/constellation`, {
        query: {
            lat,
            lng,
            date,
            hour,
            min
        },
        headers: {
            Authorization: `Bearer ${config.livlogApiKey}`
        }
    })

    return res
})