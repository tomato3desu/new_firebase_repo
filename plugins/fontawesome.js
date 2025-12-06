import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
    faStar,
    faBookmark, 
    faThumbsUp, 
    faCircleExclamation, 
    faMagnifyingGlass, 
    faUser, 
    faGear, 
    faArrowRightFromBracket, 
    faTriangleExclamation, 
    faMap,
    faLocationDot,
    faRoute,
    faMoon,
    faComment,
    faPenToSquare,
    faClock,
} from '@fortawesome/free-solid-svg-icons'

library.add(faStar)
library.add(faBookmark)
library.add(faThumbsUp)
library.add(faCircleExclamation)
library.add(faMagnifyingGlass)
library.add(faUser)
library.add(faGear)
library.add(faArrowRightFromBracket)
library.add(faTriangleExclamation)
library.add(faMap)
library.add(faLocationDot)
library.add(faRoute)
library.add(faMoon)
library.add(faComment)
library.add(faPenToSquare)
library.add(faClock)

config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon, {})
})