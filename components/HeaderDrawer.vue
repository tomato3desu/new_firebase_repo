<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()

const isOpen = defineModel()

const user = computed(() => authStore.loginUser)

const isAdmin = computed(() => user.value?.role === 'admin')

const close = () => {
    isOpen.value = false
}

const logout = async () => {
    await authStore.logout()
    navigateTo('/')
    close()
}
</script>

<template>
    <div 
        v-if="isOpen"
        class="fixed inset-0 bg-slate-900 bg-opacity-50 z-40"
        @click="close"
    />

    <!-- drawer本体 -->
    <div
        v-if="isOpen"
        class="fixed right-0 top-16 w-80 max-w-[100vw] sm:w-100  h-full bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to- shadow-xl z-50 p-6 transform transition-transform duration-300"
        :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
        @click.stop
    >
        <!-- ユーザー情報 -->
        <div class="flex flex-col items-center text-center mb-8">
            <NuxtImg
                :src="user?.iconImagePath || '/images/default_user.jpeg'"
                class="w-20 h-20 object-cover rounded-sm mb-2"
            />
            <p class="text-xl font-bold text-slate-50">
                {{ user?.nickname }}
            </p>
        </div>

        <!-- メニュー -->
        <nav class="space-y-4">
            <div class="flex items-center mt-6 text-slate-50">
                <font-awesome-icon 
                    icon="fa-solid fa-map"
                    class="h-8 w-8 "
                />
                <NuxtLink
                    to="/"
                    class="block text-lg hover:text-sky-300 pl-6"
                    @click="close"
                >
                    Map
                </NuxtLink>
            </div>
            <div class="flex items-center mt-6 text-slate-50">
                <font-awesome-icon
                    icon="fa-solid fa-user"
                    class="h-8 w-8"
                />
                <NuxtLink
                    to="/profile"
                    class="block text-lg hover:text-sky-300 pl-6"
                    @click="close"
                >
                    Profile
                </NuxtLink>
            </div>

            <div class="flex items-center mt-6 text-slate-50">
                <font-awesome-icon
                    icon="fa-solid fa-crown"
                    class="h-8 w-8"
                />
                <NuxtLink
                    to="/ranking"
                    class="block text-lg hover:text-sky-300 pl-6"
                    @click="close"
                >
                    Ranking
                </NuxtLink>
            </div>

            <div class="flex items-center mt-6 text-slate-50">
                <font-awesome-icon
                    icon="fa-solid fa-gear"
                    class="h-8 w-8"
                />
                <NuxtLink
                    to="/settings"
                    class="block text-lg hover:text-sky-300 pl-6"
                    @click="close"
                >
                    Settings
                </NuxtLink>
            </div>

            <div 
                v-if="isAdmin"
                class="flex items-center mt-6 text-slate-50"
            >
                <font-awesome-icon 
                    icon="fa-solid fa-triangle-exclamation" 
                    class="h-8 w-8"
                />
                <NuxtLink
                    to="/report"
                    class="block text-lg  hover:text-sky-300 pl-6"
                    @click="close"
                >
                    Report
                </NuxtLink>
            </div>

            <div class="flex items-center mt-6">
                <font-awesome-icon
                    icon="fa-solid fa-arrow-right-from-bracket"
                    class="h-8 w-8"
                />
                <button
                    class="w-full text-left text-lg text-red-400 hover:text-red-500 pl-6"
                    @click="logout"
                >
                    Sign Out
                </button>
            </div>
        </nav>
    </div>
</template>