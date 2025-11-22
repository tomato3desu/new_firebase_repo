import { defineStore } from 'pinia'

export const useReportStore = defineStore('reportStore', () => {
    const config = useRuntimeConfig()

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
        }
    }

    return { sendReport }
})