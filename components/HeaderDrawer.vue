<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()

const isOpen = defineModel()

const user = computed(() => authStore.loginUser)

const close = () => {
    isOpen.value = false
}

const logout = async () => {
    await authStore.logout()
    close()
}
</script>

<template>
    <div 
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="close"
    />

    <!-- drawer本体 -->
    <div
        v-if="isOpen"
        class="fixed right-0 top-16 w-80 h-full bg-white shadow-xl z-50 p-6 transform transition-transform duration-300"
        :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
        @click.stop
    >
        <!-- ユーザー情報 -->
        <div class="flex flex-col items-center text-center mb-8">
            <NuxtImg
                :src="user?.iconImagePath || '/images/default_user.jpeg'"
                class="w-20 h-20 object-cover rounded-sm mb-2"
            />
            <p class="text-xl font-bold">
                {{ user?.nickname }}
            </p>
            <p class="text-sm text-gray-500">
                {{ user?.email }}
            </p>
        </div>

        <!-- メニュー -->
        <nav class="space-y-4">
            <div class="flex items-center mt-6">
                <font-awesome-icon
                    icon="fa-solid fa-user"
                    class="h-8 w-8"
                />
                <NuxtLink
                    to="/profile"
                    class="block text-lg text-gray-700 hover:text-sky-500 pl-6"
                    @click="close"
                >
                    Profile
                </NuxtLink>
            </div>

            <div class="flex items-center mt-6">
                <font-awesome-icon
                    icon="fa-solid fa-gear"
                    class="h-8 w-8"
                />
                <NuxtLink
                    to="/settings"
                    class="block text-lg text-gray-700 hover:text-sky-500 pl-6"
                    @click="close"
                >
                    Settings
                </NuxtLink>
            </div>

            <div class="flex items-center mt-6">
                <font-awesome-icon
                    icon="fa-solid fa-arrow-right-from-bracket"
                    class="h-8 w-8"
                />
                <button
                    class="w-full text-left text-lg text-red-500 hover:text-red-600 pl-6"
                    @click="logout"
                >
                    Sign Out
                </button>
            </div>
        </nav>
    </div>
</template>