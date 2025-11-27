import { defineStore } from 'pinia'

export const useReportStore = defineStore('reportStore', () => {
    const config = useRuntimeConfig()

    const userReportsById = ref({}) // key: userReportId, value: {reportDto}
    const displayUserReportsId = ref([])
    const reviewReportsById = ref({}) // key: reviewReportId, value: {reportDto}
    const disPlayReviewReportsId = ref([])

    /**
     * status = pendingのreportを全件取得
     * @param {*} token 
     */
    const fetchPendingReviewReports = async (token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/report/pending/all`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            disPlayReviewReportsId.value = []

            for (const report of res) {
                reviewReportsById.value[report.id] = report
                disPlayReviewReportsId.value.push(report.id)
            }
        }
        catch (error) {
            console.error("failed to fetch reports", error)
        }
    }

    const sendUserReport = async (reportRequest, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/report/user`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: reportRequest
            })

            if (res !== undefined) {
                throw new Error('バックエンドエラー')
            }
        }
        catch (error) {
            console.error('通報失敗', error)
            throw error
        }
    }

    /**
     * review通報
     * @param {*} reportRequest 
     * @param {*} token 
     */
    const sendReviewReport = async (reportRequest, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/report/review`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: reportRequest
            })

            if (res !== undefined) { 
                throw new Error('バックエンドエラー')
            }
        }
        catch (error) {
            console.error('通報失敗', error)
            throw error
        }
    }

    return { reviewReportsById, disPlayReviewReportsId, sendUserReport, sendReviewReport, fetchPendingReviewReports }
})