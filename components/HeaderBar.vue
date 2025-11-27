<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.loginUser)

const isOpenHeaderDrawer = ref(false)

const toggleDrawer = () => {
    if (!authStore.isLoggedIn) return
    if (!isOpenHeaderDrawer.value) {
        isOpenHeaderDrawer.value = true
    }
    else {
        isOpenHeaderDrawer.value = false
    }
}
</script>

<template>
    <div class="bg-white border-b-4 shadow-md border-gray-300 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <NuxtLink
            to="/"
            class="text-4xl font-bit text-emerald-300"
        >
            tomato
        </NuxtLink>
        <div class=" flex items-center justify-between gap-6 px-6">
            <NuxtLink
                v-if="!isLoggedIn"
                to="/login"
                class="text-2xl text-sky-400"
            >
                sign in
            </NuxtLink>
            <NuxtLink
                v-if="!isLoggedIn"
                to="/register"
                class="text-2xl text-emerald-400"
            >sign up</NuxtLink>
            <!-- ログイン中アイコン -->
            <div
                v-if="isLoggedIn"
                class="cursor-pointer"
                @click="toggleDrawer"
            >
                <NuxtImg
                    :src="user?.iconImagePath || 'images/default_user.jpeg'"
                    alt="icon"
                    class="w-12 h-12 object-cover rounded-sm"
                />
            </div>
        </div>
    </div>
    <HeaderDrawer
        v-model="isOpenHeaderDrawer"
    />
</template>