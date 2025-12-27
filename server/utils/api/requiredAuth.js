import admin from "./firebaseAdmin"

export async function requiredAuth(event) {
    const authHeader = getHeader(event, 'authorization')

    if (!authHeader?.startsWith('Bearer ')) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Missing Authorization header'
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = await admin.auth().verifyIdToken(token)

        return decoded
    }
    catch (error) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid ID token'
        })
    }
}