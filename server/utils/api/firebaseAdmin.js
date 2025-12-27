import admin from "firebase-admin"

const config = useRuntimeConfig()

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: config.firebaseAdmin.projectId,
            clientEmail: config.firebaseAdmin.clientEmail,
            privateKey: config.firebaseAdmin.privateKey.replace(/\\n/g, '\n')
        })
    })
}

export default admin