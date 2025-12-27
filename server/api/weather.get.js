import { requiredAuth } from "~/server/utils/api/requiredAuth"
import { checkRateLimit } from "~/server/utils/api/rateLimmiter"

export default defineEventHandler(async (event) => {
    const { uid } = await requiredAuth(event)
    checkRateLimit(uid, 6, 60_000)
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