import getBoxenColor from "../styles/styles.js"
import chalk from "chalk"
import boxen from "boxen"

export const createSelectableItem = (id, type = undefined) => {
    return {
        name: id,
        selected: false,
        type: type,
        fiber: null
    }
}


export const displayElementList = (elements, index) => {

    elements.map((element, i) => {
        if (index === i) {
            element.selected = true
        } else {
            element.selected = false
        }

    })

    console.log('Available elements')
    elements.forEach((element) => {

        const style = getBoxenColor(element.type);

        if (element.selected == true) {
            const text = `[*] ${element.name}`
            console.log(boxen(chalk.black(`${text}`), style))
        } else {
            const text = `[ ] ${element.name}`
            console.log(boxen(chalk.black(`${text}`), style))
        }

    })

}




