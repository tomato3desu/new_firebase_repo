<script setup>
const isOpen = defineModel()
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50 pointer-events-none">
        <div class="text-slate-50 bg-gradient-to-tl from-slate-900 from- via-slate-700 via- to-slate-400 to- p-8 rounded-lg shadow-lg w-80 max-w-[calc(100vw-16px)] md:w-96 z-50 flex flex-col gap-2 pointer-events-auto">
            <NuxtLink
                to="/login"
                class="bg-sky-400 hover:bg-sky-500 rounded text-center"
                @click="isOpen = false"
            >
                sign in
            </NuxtLink>
            <NuxtLink
                to="/register"
                class="bg-teal-400 hover:bg-teal-500 rounded text-center"
                @click="isOpen = false"
            >
                sign up
            </NuxtLink>
            <button
                class="bg-gray-300 hover:bg-gray-400 rounded text-center"
                @click="isOpen = false"
            >
                cancel
            </button>
        </div>
    </div>
</template>