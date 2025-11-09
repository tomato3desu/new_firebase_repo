import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faStar, faBookmark, faThumbsUp, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

library.add(faStar)
library.add(faBookmark)
library.add(faThumbsUp)
library.add(faCircleExclamation)

config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon, {})
})