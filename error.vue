<script setup>
const error = useError()
</script>

<template>
    <div 
        class=" h-[100vh] bg-sky-400 text-slate-50 bg-[url(/images/lighthouse2.jpg)] sm:bg-[url(/images/lighthouse.jpg)] bg-cover bg-center flex flex-col items-center justify-center"
    >
        <p class="text-4xl mb-10">
            {{ error.statusCode }}
        </p>
        <p>{{ error.message }}</p>
    </div>
</template>