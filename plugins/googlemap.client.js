import { setOptions } from "@googlemaps/js-api-loader"

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    setOptions({
        key: config.public.googleMapApiKey,
        v: "weekly"
    })
})