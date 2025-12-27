// server/utils/rateLimiter.js
const userRequests = new Map()

export function checkRateLimit(uid, limit = 10, windowMs = 60_000) {
    const now = Date.now()
    const record = userRequests.get(uid) || []

    // window内のみ残す
    const recent = record.filter(ts => now - ts < windowMs)
    recent.push(now)

    userRequests.set(uid, recent)

    if (recent.length > limit) {
        throw createError({
            statusCode: 429,
            statusMessage: 'Too many requests'
        })
    }
}
