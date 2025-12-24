<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.loginUser)

const config = useRuntimeConfig()

const isOpenHeaderDrawer = ref(false)
const isOpenHeaderSignDialog = ref(false)

const toggleDrawer = () => {
    if (!authStore.isLoggedIn) return
    if (!isOpenHeaderDrawer.value) {
        isOpenHeaderDrawer.value = true
    }
    else {
        isOpenHeaderDrawer.value = false
    }
}

const openSignDrawer = () => {
    if (authStore.isLoggedIn) return
    isOpenHeaderSignDialog.value = true
}
</script>

<template>
    <div class="bg-gradient-to-tl from-slate-900 from- via-slate-700 via- to-slate-400 to- border-b border-slate-400 shadow-md h-16 flex items-center px-4 sticky top-0 z-50">
        <NuxtLink
            to="/"
            class="text-4xl font-bit text-yellow-300 hover:text-yellow-400 mr-4 flex items-center"
        >
            StarSeeker
        </NuxtLink>
        <div class="flex items-center ml-auto">
            <div class="hidden sm:flex items-center">
                <NuxtLink
                    v-if="!isLoggedIn"
                    to="/login"
                    class="text-xl text-sky-400 hover:text-sky-500 break-words mr-2"
                >
                    sign in
                </NuxtLink>
                <NuxtLink
                    v-if="!isLoggedIn"
                    to="/register"
                    class="text-xl text-teal-400 hover:text-teal-500 break-words"
                >sign up</NuxtLink>
            </div>
            <font-awesome-icon 
                v-if="!isLoggedIn"
                icon="fa-solid fa-bars" 
                class="sm:hidden text-3xl ml-2 h-6 w-6 text-slate-50"
                @click="openSignDrawer"
            />
            <!-- ログイン中アイコン -->
            <div
                v-if="isLoggedIn"
                class="cursor-pointer"
                @click="toggleDrawer"
            >
                <NuxtImg
                    :src="user?.iconImagePath ? `${config.public.r2PublicUrl}/${user.iconImagePath}` : 'images/default_user.jpeg'"
                    class="w-12 h-12 object-cover rounded-sm mr-auto"
                />
            </div>
        </div>
    </div>
    <HeaderDrawer
        v-model="isOpenHeaderDrawer"
    />
    <HeaderSignDialog
        v-model="isOpenHeaderSignDialog"
    />
</template>