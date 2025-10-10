<script setup>
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <client-only>
            <HeaderBar />
        </client-only>
        <div class="flex-1">
            <slot />
        </div>
    </div>
</template>