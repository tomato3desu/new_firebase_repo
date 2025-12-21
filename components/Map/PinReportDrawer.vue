<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useAuthStore } from '~/composables/stores/auth'
import { useReportStore } from '~/composables/stores/report'

const authStore = useAuthStore()
const pinStore = usePinStore()
const reportStore = useReportStore()

const toast = useToast()

const isOpen = defineModel()

const props = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const pin = computed(() => pinStore.pinsById[props.pinId])

const reason = ref(null)
const comment = ref(null)
const commentError = ref(null)

const sendToBackend = async () => {
    if (commentError.value) return

    const reportRequest = {
        pinId: pin.value.id,
        reason: reason.value,
        comment: comment.value
    }

    try {
        const token = await authStore.getIdToken()
        await reportStore.sendPinReport(reportRequest, token)
        toast.success({
            title: '通報に成功しました。'
        })
        close()
    }
    catch (error) {
        toast.error({
            title: '通報に失敗しました。時間を置いて再度お試しください',
            message: error.message
        })
        close()
    }
}

const close = () => {
    reason.value = null
    comment.value = null
    commentError.value = null
    isOpen.value = false
}

watch(comment, (value) => {
    if (value && value.length >= 800) {
        commentError.value = "800字以内で入力してください"
    }
    else {
        commentError.value = null
    }
})
</script>

<template>
    <div 
        v-if="isOpen"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
        <div class="text-slate-50 bg-gradient-to-tl from-slate-900 from- via-slate-700 via- to-slate-400 to- rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h2
                class="text-xl font-semibold mb-4"
            >
                通報理由
            </h2>
            <label>
                <input 
                    v-model="reason"
                    type="radio" 
                    value="inappropriate" 
                >
                不適切な内容・画像
            </label>
            <label>
                <input 
                    v-model="reason"
                    type="radio" 
                    value="overlap" 
                >
                同内容のピンが複数存在する
            </label>
            <label>
                <input 
                    v-model="reason"
                    type="radio" 
                    value="wrong_location"
                >
                位置情報間違い
            </label>
            <label>
                <input 
                    v-model="reason"
                    type="radio"
                    value="other"
                >
                その他
            </label>
            <p 
                v-if="commentError && reason === 'other'"
                class="text-red-500 mb-1"
            >
                {{ commentError }}
            </p>
            <textarea
                v-if="reason === 'other'"
                v-model="comment"
                placeholder="詳細を入力してください"
                class="text-slate-800 mb-4 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <div class="flex items-center">
                <button
                    class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                    @click="close"
                >
                    キャンセル
                </button>
                <button
                    class="px-4 py-2 rounded disabled:bg-blue-200  bg-blue-500 text-white hover:bg-blue-600 transition"
                    @click="sendToBackend"
                >
                    通報
                </button>
            </div>
        </div>
    </div>
</template>