<script setup>
const isOpen = defineModel()

const { star } = defineProps({
    star: {
        type: Object,
        required: false
    }
})

// const jpName = star.jpName
// const enName = star.enName
// const direction = star.direction
// const altitude = star.altitude
// const season = star.season + 'の星座'
// const content = star.content
// const origin = star.origin !== 'なし' ? star.origin : ''
// const ecliptical = star.eclipticalFlag === '1' ? '黄道12星座' : ''
// const ptolemy = star.ptolemyFlag === '1' ? 'トレミーの48星座' : ''
// const icon = star.starIcon
// const image = star.starImage

const close = () => {
    isOpen.value = false
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
        <div 
            class="relative text-slate-50 bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to- rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
        >
            <!-- 閉じるボタン -->
            <font-awesome-icon 
                icon="fa-solid fa-xmark" 
                class="absolute top-6 right-6 text-slate-50 text-2xl h-6 w-6"
                @click="close"
            />
            <p class="text-3xl font-medium">
                {{ star?.jpName }}
            </p>
            <p class="text-sm py-0.5">
                {{ star?.enName }}
            </p>
            <NuxtImg 
                :src="star?.starImage"
                alt="image"
                class="my-1"
            />
            <div class="flex items-center">
                <font-awesome-icon 
                    icon="fa-solid fa-compass" 
                    class="h-4 w-4 mr-2"
                />
                <p>方位：{{ star?.direction }}</p>
            </div>
            <div class="flex items-center">
                <font-awesome-icon
                    icon="fa-solid fa-arrows-up-down"
                    class="h-4 w-4 mr-2"
                />
                <p>高度：{{ star?.altitude }}</p>
            </div>
            <div class="flex items-center">
                <font-awesome-icon 
                    icon="fa-solid fa-arrows-spin" 
                    class="h-4 w-4 mr-2"
                />
                <p>季節：{{ star?.season }}</p>
            </div>
            <div class="flex items-center gap-2 text-sms">
                <p
                    v-if="star?.eclipticalFlag === '1'"
                    class="bg-slate-50 text-slate-800 rounded-md px-2 py-1"
                >
                    黄道12星座
                </p>
                <p
                    v-if="star?.ptolemyFlag === '1'"
                    class="bg-slate-50 text-slate-800 rounded-md px-2 py-1"
                >
                    トレミーの48星座
                </p>
            </div>
            <div class="flex items-center">
                <font-awesome-icon
                    icon="fa-solid fa-file-lines"
                    class="h-4 w-4 mr-2"
                />
                <p>詳細</p>
            </div>
            <p class="break-words">
                {{ star?.content }}
            </p>
            <div class="flex items-center">
                <font-awesome-icon
                    icon="fa-solid fa-book-open"
                    class="h-4 w-4 mr-2"
                />
                <p>神話</p>
            </div> 
            <p class="break-words">
                {{ star?.origin }}
            </p>
        </div>
    </div>
</template>