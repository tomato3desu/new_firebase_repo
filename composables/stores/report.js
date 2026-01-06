import { defineStore } from 'pinia'

export const useReportStore = defineStore('reportStore', () => {
    const config = useRuntimeConfig()

    const userReportsById = ref({}) // key: userReportId, value: {reportDto}
    const displayUserReportsId = ref([])
    const pinReportsById = ref({}) // key: userReportId, value: {reportDto}
    const displayPinReportsId = ref([])
    const reviewReportsById = ref({}) // key: reviewReportId, value: {reportDto}
    const displayReviewReportsId = ref([])

    /**
     * status = pending のuserreportを全件取得
     * @param {*} token 
     */
    const fetchPendingUserReports = async (token) => {
        const res = await $fetch(`${config.public.apiBase}/api/report/user/pending/all`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        displayUserReportsId.value = []

        for (const report of res) {
            userReportsById.value[report.id] = report
            displayUserReportsId.value.push(report.id)
        }
    }

    /**
     * status = pending のpinreportを全件取得
     * @param {*} token 
     */
    const fetchPendingPinReports = async (token) => {
        const res = await $fetch(`${config.public.apiBase}/api/report/pin/pending/all`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        displayPinReportsId.value = []

        for (const report of res) {
            pinReportsById.value[report.id] = report
            displayPinReportsId.value.push(report.id)
        }
    }

    /**
     * status = pendingのreviewreportを全件取得
     * @param {*} token 
     */
    const fetchPendingReviewReports = async (token) => {
        const res = await $fetch(`${config.public.apiBase}/api/report/review/pending/all`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        displayReviewReportsId.value = []

        for (const report of res) {
            reviewReportsById.value[report.id] = report
            displayReviewReportsId.value.push(report.id)
        }
    }

    /**
     * user通報
     * @param {*} reportRequest 
     * @param {*} token 
     */
    const sendUserReport = async (reportRequest, token) => {
        await $fetch(`${config.public.apiBase}/api/report/user`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: reportRequest
        })
    }

    /**
     * pin通報
     * @param {*} reportRequest 
     * @param {*} token 
     */
    const sendPinReport = async (reportRequest, token) => {
        await $fetch(`${config.public.apiBase}/api/report/pin`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: reportRequest
        })
    }

    /**
     * review通報
     * @param {*} reportRequest 
     * @param {*} token 
     */
    const sendReviewReport = async (reportRequest, token) => {
        await $fetch(`${config.public.apiBase}/api/report/review`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: reportRequest
        })
    }

    /**
     * userReport.status = resolved に変更する
     * @param {*} reportId 
     * @param {*} token 
     */
    const sendUserReportResolved = async (reportId, token) => {
        const res = await $fetch(`${config.public.apiBase}/api/report/user/resolved/${reportId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (res !== undefined) {
            throw new Error("バックエンドエラー")
        }

        displayUserReportsId.value = displayUserReportsId.value.filter(id => id !== reportId)
        delete userReportsById.value[reportId]
    }

    /**
     * pinReport.status = resolved に変更する
     * @param {*} reportId 
     * @param {*} token 
     */
    const sendPinReportResolved = async (reportId, token) => {
        const res = await $fetch(`${config.public.apiBase}/api/report/pin/resolved/${reportId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (res !== undefined) {
            throw new Error("バックエンドエラー")
        }

        displayPinReportsId.value = displayPinReportsId.value.filter(id => id !== reportId)
        delete pinReportsById.value[reportId]
    }

    /**
     * reviewReport.status = resolved に変更する
     * @param {*} reportId 
     * @param {*} token 
     */
    const sendReviewReportResolved = async (reportId, token) => {
        const res = await $fetch(`${config.public.apiBase}/api/report/review/resolved/${reportId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (res !== undefined) {
            throw new Error("バックエンドエラー")
        }

        displayReviewReportsId.value = displayReviewReportsId.value.filter(id => id !== reportId)
        delete reviewReportsById.value[reportId]
    }

    const banUser = async (userId, token) => {
        const res = await $fetch(`${config.public.apiBase}/api/user/ban/${userId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (res !== undefined) {
            throw new Error("バックエンドエラー")
        }
    }

    return {
        userReportsById,
        pinReportsById,
        reviewReportsById,
        displayUserReportsId,
        displayPinReportsId,
        displayReviewReportsId,
        sendUserReport,
        sendPinReport,
        sendReviewReport,
        fetchPendingUserReports,
        fetchPendingPinReports,
        fetchPendingReviewReports,
        sendUserReportResolved,
        sendPinReportResolved,
        sendReviewReportResolved,
        banUser
    }
})