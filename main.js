import { connectToBrowser } from './browser.js';
import chalk from 'chalk';
import readline from 'readline';
import boxen from 'boxen';
import {
    fork,
    execSync
} from 'child_process'

const OPERATIONS = {
    SPLICE: 'xxxx-f5c5-be993402-9bd8c513-85ba2423',
    SLITTER: 'xxxx-8788-f90c2b03-476836c6-b02fce34'
}

const operationList = [OPERATIONS.SLITTER, OPERATIONS.SPLICE]

// Pass the browser instance to the scraper controller
const main = async () => {
    console.log(chalk.red('this is a test'))
    let browserInstance = await connectToBrowser();
    const apex = (await browserInstance.pages())[0];

    //get the id so we can determine root
    const boxId = await apex.evaluate(() => {
        return document.querySelector('.frmIntx_spElementName').textContent.split(' ')[0]
    })

    //get the cables
    const cables = await apex.evaluate(() => {

        const raw = interconexionsIU.interconexions.cables.map((cable) => JSON.stringify({
            name: cable.name,
            type: cable.colorPattern.name
        }));
        return raw.map((cable) => JSON.parse(cable));
    });

    //get the splitters
    const splitters = await apex.evaluate(() => {
        const spls = interconexionsIU.interconexions.networkClients.filter(element => element instanceof Icx_Splitter);
        return spls.map((element => element.name));
    })

    //get root cable TODO filter by FEE identifier
    const root = getIncomingCable(cables, boxId)


    //grant user with the root cable and the available operations
    readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        emitKeypressEvents: process.stdin,
    });

    process.stdin.setRawMode(true);

    let index = 0
    let selectableElements = cables.map((cable) => createSelectableItem(cable.name, cable.type));
    const spls = splitters.map(spl => createSelectableItem(spl, 'splitter'));
    selectableElements = [...selectableElements, ...spls];


    const newList = selectableElements.filter(element => element.name !== root.name);

    process.stdin.on('keypress', async (str, key) => {
        execSync('cls', {
            stdio: 'inherit'
        });
        console.log(`MAIN CABLE: ${root.name}`)

        if (key.name === 'up') {
            if (index > 0) {
                index = index - 1
            }
            displayElementList(newList, index)
        }
        if (key.name === 'down') {
            if (index < newList.length - 1) {
                index = index + 1
            }

            displayElementList(newList, index)
        }

        if (key.name === 'right') {
            console.log(`You have chosen ${newList[index].name}`);
            const selected = newList[index].name;
            let fibers = []

            const child_process = fork('./test.js');

            // Send the data to forked process
            child_process.on('message', async (data) => {
                fibers = data.fibers;

                const args = {
                    root: root.name,
                    cable: selected,
                    fibers: fibers
                }

                await apex.evaluate((args) => {
                    const spliceFiberToCable = (root, cable, fibers) => {
                        const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === root);

                        if (cable[0] == 'S' && cable[1] == 'P' && cable[2] == 'L') {
                            const cableElement = Icx_Connector.objects.filter((obj) => obj.pare.name === cable);
                            interconexionsIU.interconexions.doNewConexio(rootElement[fibers[0] - 1], cableElement[0], 'xxxx-f5c5-be993402-9bd8c513-85ba2423', "", "", () => { });

                        } else {

                            const cableElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === cable);

                            let offset = fibers[0]
                            const splicedFibers = fibers.map((fiber) => fiber - offset)

                            fibers.forEach((fiber, index) => {
                                interconexionsIU.interconexions.doNewConexio(rootElement[fiber - 1], cableElement[splicedFibers[index]], 'xxxx-f5c5-be993402-9bd8c513-85ba2423', "", "", () => { });
                            })

                        }

                    }

                    spliceFiberToCable(args.root, args.cable, args.fibers)

                }, args);
            });


            displayElementList(newList, index)
        }

        if (key.name === 'left') {
            console.log(`You have chosen to slitter the rest of the fibers to ${newList[index].name}`);
            const selected = newList[index].name;

            const args = {
                root: root.name,
                cable: selected
            }

            await apex.evaluate((args) => {

                const sliter = "xxxx-8788-f90c2b03-476836c6-b02fce34"

                const cableElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === args.cable);
                const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === args.root);


                rootElement.forEach((fiber, index) => {
                    if (fiber.conexions.length == 0 && !fiber.reserved_b) {
                        interconexionsIU.interconexions.doNewConexio(rootElement[index], cableElement[index], sliter, "", "", () => { });
                    }
                })


                const positionElements = (root) => {

                    const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === root);
                    const splice = 'xxxx-f5c5-be993402-9bd8c513-85ba2423';
                    const slitter = 'xxxx-8788-f90c2b03-476836c6-b02fce34';


                    let verticalOffset = 0
                    let horizontalOffset = 1000

                    rootElement.forEach((fiber, index) => {

                        if (fiber.conexio && fiber.conexio.tipoConector === splice) {
                            const conectorId = fiber.conexio.conector2.pare.name
                            const conectorElement = interconexionsIU.interconexions.objs.filter((obj) => obj.name === conectorId)[0];
                            const { x, y } = interconexionsIU.interconexions.objs.filter((obj) => obj.name === root)[0].rect;
                            const { h, w } = conectorElement.rect

                            const xPos = x + horizontalOffset
                            const yPos = y - verticalOffset
                            conectorElement.rect.setPos(xPos, yPos, xPos + w, yPos + h)
                            verticalOffset -= 200
                            horizontalOffset -= 300

                        }

                        if (fiber.conexio && fiber.conexio.tipoConector == slitter) {
                            const slitterId = fiber.conexio.conector2.pare.name
                            const sitterConnector = interconexionsIU.interconexions.objs.filter((obj) => obj.name === slitterId)[0];

                            const { x, y } = interconexionsIU.interconexions.objs.filter((obj) => obj.name === root)[0].rect;
                            const { h, w } = sitterConnector.rect

                            const xPos = x - 600
                            const yPos = y

                            sitterConnector.rect.setPos(xPos, yPos, xPos + w, yPos + h)

                        }
                    })

                }

                positionElements(args.root); 

            }, args);



            displayElementList(newList, index)
        }


        //reserve on root 
        if (key.name === 'r') {
            console.log(`You have chosen to reserve on root`);
            let fibers = []

            const {
                fork
            } = require('child_process');

            const child_process = fork('./test.js');

            // Send the data to forked process
            child_process.on('message', async (data) => {
                fibers = data.fibers;

                const args = {
                    root: root.name,
                    fibers: fibers
                }

                await apex.evaluate((args) => {
                    const reserveFibers = (id, reserved) => {

                        const fibers = Icx_Connector.objects.filter(obj => obj.pare.name == id)

                        fibers.forEach((fiber, index) => {
                            let updated = fiber.element;
                            updated.reserved_b = true;

                            if (index == reserved[index] - 1) {
                                Icx_Interconexions.prototype.doUpdateFiber(updated, () => { });
                            }

                        })
                    }

                    reserveFibers(args.root, args.fibers)

                }, args);

            });


            displayElementList(newList, index)
        }


        if (key.name === 'v') {
            console.log(`You have chosen to reserve on root`);
            let fibers = []

            const child_process = fork('./test.js');

            // Send the data to forked process
            child_process.on('message', async (data) => {
                fibers = data.fibers;

                const args = {
                    root: root.name,
                    fibers: fibers
                }

                await apex.evaluate((args) => {
                    const reserveFibers = (id, reserved) => {

                        const fibers = Icx_Connector.objects.filter(obj => obj.pare.name == id)

                        fibers.forEach((fiber, index) => {
                            let updated = fiber.element;
                            updated.reserved_a = true;

                            if (index == reserved[index] - 1) {
                                Icx_Interconexions.prototype.doUpdateFiber(updated, () => { });
                            }

                        })
                    }

                    reserveFibers(args.root, args.fibers)

                }, args);

            });


            displayElementList(newList, index)
        }






    });

}


const createSelectableItem = (id, type = undefined) => {
    return {
        name: id,
        selected: false,
        type: type,
        fiber: null
    }
}



const getIncomingCable = (cables, id) => {
    let res;
    cables.forEach(cable => {

        const destination = cable.name.split('-')[3].trim();
        if (destination === id) res = cable;

    });
    return res;
}

const spliceFiberToCable = (root, cable, fibers) => {

    const cableElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === cable);
    const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === root);

    const index = 0
    fibers.forEach((fiber) => {
        interconexionsIU.interconexions.doNewConexio(rootElement[fibers[index] - 1], cableElement[index], OPERATIONS.SPLICE, "", "", () => { });
        if (index != fibers.length - 1) {
            //tenemos una fibra de doble vuelta y también analiza si tenemos una de tercera 
            if (fibers[index + 1] == fibers[index] + 1) {
                index = index + 1;
            } else {
                index = index + 3
            }
        }
    })

}

const spliceFiberToSPL = () => {


}

const spliceFiberFromSPLtoCable = () => {

}

const slitterRemainingFibers = () => {

}
let Style = {
    padding: 1,
    borderStyle: 'round'
}


const getBoxenColor = (type) => {
    if (type === 'Cable 48 f.o.') {
        return { ...Style, backgroundColor: 'red' }
    }
    if (type === 'Cable 12 f.o.') {
        return { ...Style, backgroundColor: '#ffa500' }
    }

    if (type === 'splitter') {
        return { ...Style, backgroundColor: 'gray' }
    }
    return { ...Style, backgroundColor: 'yellow' }

}


const displayElementList = (elements, index) => {


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
            console.log(boxen(`${text}`, style))
        } else {
            const text = `[ ] ${element.name}`
            console.log(boxen(`${text}`, style))
        }

    })

}


const displayElementListWithFibers = (elements, index) => {

    elements.map((element, i) => {
        if (index === i) {
            element.selected = true
        } else {
            element.selected = false
        }

    })

    console.log('Available elements')
    elements.forEach((element) => {
        if (element.selected == true) {
            console.log(`[*] ${element.name}`)
        } else {
            console.log(`[] ${element.name}`)
        }

    })

}




const spliceFibersToCable = async (apex, selected, root, fibers) => {


    const args = {
        root: root.name,
        cable: selected,
        fibers: fibers
    }

    await apex.evaluate((args) => {
        const spliceFiberToCable = (root, cable, fibers) => {

            const cableElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === cable);
            const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === root);

            let index = 0
            let offset = 0
            fibers.forEach((fiber) => {
                interconexionsIU.interconexions.doNewConexio(rootElement[fiber - 1], cableElement[index], 'xxxx-f5c5-be993402-9bd8c513-85ba2423', "", "", () => { });
                if (index < fibers.length) {
                    //tenemos una fibra de doble vuelta y también analiza si tenemos una de tercera 
                    if (fibers[index + 1] == fiber + 1) {
                        index = index + 1;
                        offset = offset + 1;
                    } else {
                        index = index + 3 - offset;
                    }
                }
            })

        }

        spliceFiberToCable(args.root, args.cable, args.fibers)

    }, args);
}


main()