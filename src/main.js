import { connectToBrowser } from './browser.js';
import readline from 'readline';
import {
    fork,
    execSync
} from 'child_process'
import { getSetupParams } from './setup/getParams.js';
import { createSelectableItem, displayElementList } from './items/items.js';
import { reserveFibersOnRoot, slitterFibers, spliceFibersToCable, spliceFromMOStoSAT } from './apex-functions/apex-functions.js';

const OPERATIONS = {
    SPLICE: 'xxxx-f5c5-be993402-9bd8c513-85ba2423',
    SLITTER: 'xxxx-8788-f90c2b03-476836c6-b02fce34'
}


let SELECTION_INDEX = 0
// Pass the browser instance to the scraper controller
const main = async () => {
    //start browser insatnce
    let browserInstance = await connectToBrowser();
    //get apex 
    const apex = (await browserInstance.pages())[0];

    //grant user with the root cable and the available operations
    readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        emitKeypressEvents: process.stdin,
    });

    process.stdin.setRawMode(true);

    //start interacting with console 
    process.stdin.on('keypress', async (str, key) => {

        //get setup params 
        const { root, cables, splitters } = await getSetupParams(apex)
        let selectableElements = cables.map((cable) => createSelectableItem(cable.name, cable.type));
        const spls = splitters.map(spl => createSelectableItem(spl, 'splitter'));
        selectableElements = [...selectableElements, ...spls];


        const newList = selectableElements.filter(element => element.name !== root.name);

        execSync('cls', {
            stdio: 'inherit'
        });
        console.log(`MAIN CABLE: ${root.name}`)

        if (key.name === 'up') {
            if (SELECTION_INDEX > 0) {
                SELECTION_INDEX = SELECTION_INDEX - 1
            }
            displayElementList(newList, SELECTION_INDEX)
        }
        if (key.name === 'down') {
            if (SELECTION_INDEX < newList.length - 1) {
                SELECTION_INDEX = SELECTION_INDEX + 1
            }

            displayElementList(newList, SELECTION_INDEX)
        }

        if (key.name === 'right') {
            console.log(`You have chosen ${newList[SELECTION_INDEX].name}`);
            const selected = newList[SELECTION_INDEX].name;

            const child_process = fork('./src/input/getFiberNumber.js');

            //get data from forked process 
            child_process.on('message', async (data) => {
                const fibers = data.fibers;

                const args = {
                    root: root.name,
                    cable: selected,
                    fibers: fibers,
                }

                spliceFibersToCable(apex, args)

            });

            displayElementList(newList, SELECTION_INDEX)
        }

        if (key.name === 'left') {
            console.log(`You have chosen to slitter the rest of the fibers to ${newList[SELECTION_INDEX].name}`);
            const selected = newList[SELECTION_INDEX].name;

            const args = {
                root: root.name,
                cable: selected
            }

            slitterFibers(apex, args)

            displayElementList(newList, SELECTION_INDEX)
        }


        //reserve on root 
        if (key.name === 'r') {
            console.log(`You have chosen to reserve on root`);
            let fibers = []

            const child_process = fork('./src/input/getFiberNumber.js');

            // Send the data to forked process
            child_process.on('message', async (data) => {
                fibers = data.fibers;

                const args = {
                    root: root.name,
                    fibers: fibers
                }

                reserveFibersOnRoot(apex, args)

            });

            displayElementList(newList, SELECTION_INDEX)
        }


        if(key.name == 's'){
            console.log(`You have chosen to splice to SAT cable`);
            const selected = newList[SELECTION_INDEX].name;
            let fibers = []

            const child_process = fork('./src/input/getFiberNumber.js');

            // Send the data to forked process
            child_process.on('message', async (data) => {
                fibers = data.fibers[0];

                const args = {
                    target: selected,
                    fibers: fibers
                }

                spliceFromMOStoSAT(apex, args)

            });

            displayElementList(newList, SELECTION_INDEX)

        }

    });
}



main()