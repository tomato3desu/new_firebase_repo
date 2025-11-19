import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faStar, faBookmark, faThumbsUp, faCircleExclamation, faMagnifyingGlass, faUser, faGear, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'

library.add(faStar)
library.add(faBookmark)
library.add(faThumbsUp)
library.add(faCircleExclamation)
library.add(faMagnifyingGlass)
library.add(faUser)
library.add(faGear)
library.add(faArrowRightFromBracket)

config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon, {})
})