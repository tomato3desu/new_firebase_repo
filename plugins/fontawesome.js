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
    faRotate,
    faT,
    faEarthAsia,
    faPaperPlane,
    faCrown,
    faClover,
    faBars,
    faUmbrellaBeach,
    faSnowflake,
    faCalendarDays,
    faXmark,
    faAngleLeft,
    faAngleRight,
    faCompass,
    faArrowsUpDown,
    faArrowsSpin,
    faFileLines,
    faBookOpen,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons'
import { faCanadianMapleLeaf } from '@fortawesome/free-brands-svg-icons'

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
library.add(faRotate)
library.add(faT)
library.add(faEarthAsia)
library.add(faPaperPlane)
library.add(faCrown)
library.add(faClover) // 春
library.add(faBars)
library.add(faUmbrellaBeach) // 夏
library.add(faSnowflake) // 冬
library.add(faCalendarDays)
library.add(faClock)
library.add(faXmark)
library.add(faAngleLeft)
library.add(faAngleRight)
library.add(faCompass)
library.add(faArrowsUpDown)
library.add(faArrowsSpin)
library.add(faFileLines)
library.add(faBookOpen)

library.add(faRegularStar)

library.add(faCanadianMapleLeaf) // 秋

config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon, {})
})