import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

let initialized = false

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    if (!initialized) {
        setOptions({
            key: config.public.googleMapApiKey,
            v: "weekly"
        })

        initialized = true
    }

    return {
        provide: {
            googleMaps: {
                // マップのロード関数
                loadMap: async (el, options) => {
                    const { Map } = await importLibrary("maps")
                    return new Map(el, options)
                },

                // Marker ライブラリ
                loadMarkerLib: async () => {
                    const { AdvancedMarkerElement, PinElement } = await importLibrary("marker")
                    return { AdvancedMarkerElement, PinElement }
                },

                loadCoreLib: async () => {
                    const { ColorScheme } = await importLibrary('core')
                    return ColorScheme
                }
            }
        }
    }
})