<script setup>
const modelValue = defineModel({ type: Number, default: 3 })

const props = defineProps({
    max: {
        type: Number,
        default: 5
    },
    label: {
        type: String,
        default: ''
    }
})

const setRating = (value) => {
    modelValue.value = value
}
</script>

<template>
    <div>
        <label class="block text-sm font-medium mb-1">
            {{ label }}
        </label>

        <div class="flex gap-1 cursor-pointer">
            <font-awesome-icon
                v-for="star in max"
                :key="star"
                icon="fa-solid fa-star"
                class="h-6 w-6"
                :class="star <= modelValue ? 'text-yellow-400' : 'text-gray-400'"
                @click="setRating(star)"
            />
        </div>
    </div>
</template>
