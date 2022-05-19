const browserObject = require('./browser');
const scraperController = require('./pageController');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});



const id = 'J18421';

const OPERATIONS = {
    SPLICE: 'xxxx-f5c5-be993402-9bd8c513-85ba2423',
    SLITTER: 'xxxx-8788-f90c2b03-476836c6-b02fce34'
}

const operationList = [OPERATIONS.SLITTER, OPERATIONS.SPLICE]

// Pass the browser instance to the scraper controller
const main = async () => {
    let browserInstance = await browserObject.connectToBrowser();
    const apex = (await browserInstance.pages())[0];

    //get the id so we can determine root
    const boxId = await apex.evaluate(() => {
        return document.querySelector('.frmIntx_spElementName').textContent.split(' ')[0]
    })

    //get the cables
    const cables = await apex.evaluate(() => {

        const raw = interconexionsIU.interconexions.cables.map((cable) => JSON.stringify({
            name: cable.name,
            size: cable.numConn
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
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
        emitKeypressEvents: process.stdin,
    });

    process.stdin.setRawMode(true);

    let index = 0
    let selectableElements = cables.map((cable) => createSelectableItem(cable.name));
    const spls = splitters.map(spl => createSelectableItem(spl));
    selectableElements = [...selectableElements, ...spls];


    const newList = selectableElements.filter(element => element.name !== root.name);

    process.stdin.on('keypress', async (str, key) => {
        require('child_process').execSync('cls', {
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

            const {
                fork
            } = require('child_process');

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

                        const cableElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === cable);
                        const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === root);

                        let offset = fibers[0]
                        const splicedFibers = fibers.map((fiber) => fiber - offset)

                        fibers.forEach((fiber, index) => {
                            interconexionsIU.interconexions.doNewConexio(rootElement[fiber - 1], cableElement[splicedFibers[index]], 'xxxx-f5c5-be993402-9bd8c513-85ba2423', "", "", () => {});
                        })

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
                    if (fiber.conexions.length == 0) {
                        interconexionsIU.interconexions.doNewConexio(rootElement[index], cableElement[index], sliter, "", "", () => {});
                    }
                })

            }, args);



            displayElementList(newList, index)
        }

        if (key.name === 'r') {
            console.log(`You have chosen ${newList[index].name}`);
            const selected = newList[index].name;
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
                    cable: selected,
                    fibers: fibers
                }

                await apex.evaluate((args) => {
                    const reserveFibers = (id, reserved) => {

                        const fibers = Icx_Connector.objects.filter(obj => obj.pare.name == id)
                    
                        fibers.forEach((fiber, index) => {
                            let updated = fiber.element; 
                            updated.reserved_a = true;  
                    
                            if(index == reserved[index] - 1 ){
                                Icx_Interconexions.prototype.doUpdateFiber(updated, () => {}); 
                            }
                    
                        })
                    }

                    reserveFibers(args.cable, args.fibers)

                }, args);
                
            });


            displayElementList(newList, index)
        }



     


    });

}


const createSelectableItem = (id) => {
    return {
        name: id,
        selected: false,
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
        interconexionsIU.interconexions.doNewConexio(rootElement[fibers[index] - 1], cableElement[index], OPERATIONS.SPLICE, "", "", () => {});
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
        if (element.selected == true) {
            console.log(`[*] ${element.name}`)
        } else {
            console.log(`[] ${element.name}`)
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


const getUserInput = () => {
    const prompt = require('prompt-sync')({
        sigint: true
    });

    let getInput = true;
    let fibers = []

    while (getInput) {
        // Get user input
        let fiber = prompt('Add a fiber');
        // Convert the string input to a number
        fiber = Number(fiber);

        // Compare the guess to the secret answer and let the user know.
        if (fiber == 0) {
            getInput = false;
        } else {
            fibers.push(fiber)
        }

    }

    console.log(fibers)
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
                interconexionsIU.interconexions.doNewConexio(rootElement[fiber - 1], cableElement[index], 'xxxx-f5c5-be993402-9bd8c513-85ba2423', "", "", () => {});
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