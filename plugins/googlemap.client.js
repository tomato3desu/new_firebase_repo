import { setOptions, importLibrary } from "@googlemaps/js-api-loader"

let initialized = false

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    console.log(initialized)

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
                // マップのロード関数（必要なときだけ読み込む）
                loadMap: async (el, options) => {
                    const { Map } = await importLibrary("maps")
                    return new Map(el, options)
                },

                // Marker ライブラリ
                loadMarkerLib: async () => {
                    const { AdvancedMarkerElement, PinElement } = await importLibrary("marker")
                    return { AdvancedMarkerElement, PinElement }
                },

                // Autocomplete（Places）
                loadPlacesAutocomplete: async () => {
                    const { PlaceAutocompleteElement } = await importLibrary("places")
                    return PlaceAutocompleteElement
                }
            }
        }
    }
})