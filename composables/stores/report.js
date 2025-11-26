import { defineStore } from 'pinia'

export const useReportStore = defineStore('reportStore', () => {
    const config = useRuntimeConfig()

    const reportsById = ref({}) // key: reportId, value: {reportDto}
    const disPlayReportsId = ref([])

    /**
     * status = pendingのreportを全件取得
     * @param {*} token 
     */
    const fetchPendingReports = async (token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/report/pending/all`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            disPlayReportsId.value = []

            for (const report of res) {
                reportsById.value[report.id] = report
                disPlayReportsId.value.push(report.id)
            }
        }
        catch (error) {
            console.error("failed to fetch reports", error)
        }
    }

    /**
     * 通報
     * @param {*} reportRequest 
     * @param {*} token 
     */
    const sendReport = async (reportRequest, token) => {
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

    // const resolvedReport = async(reportId, token) => {
    //     try {
    //         const res = $fetch(`${config.public.apiBase}/api/report/resolved/${reportId}`, {
    //             method: 'PUT',
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         })

    //         if(res !== undefined){
    //             throw new Error('バックエンドエラー')
    //         }

    //         delete reportsById.value[reportId]
    //         disPlayReportsId.value = disPlayReportsId.value.filter((id) => id !== reportId)
            
    //     }catch(error){
    //         console.error('更新失敗', error)
    //         throw error
    //     }
    // }

    return { reportsById, disPlayReportsId, sendReport, fetchPendingReports }
})