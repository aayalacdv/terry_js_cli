const browserObject = require('./browser');
const scraperController = require('./pageController');



const id = 'J18421';

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

        const raw = interconexionsIU.interconexions.cables.map((cable) => JSON.stringify({ name: cable.name, size: cable.numConn }));
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


    displayElementList(selectableElements, index);

    process.stdin.on('keypress', (str, key) => {
        if (key.name === 'up') {
            index = index - 1
            require('child_process').execSync('cls', { stdio: 'inherit' });
            displayElementList(selectableElements, index)
        }
        if (key.name === 'down') {
            index = index + 1
            require('child_process').execSync('cls', { stdio: 'inherit' });
            displayElementList(selectableElements, index)
        }
        if (key.name === 'return') {
            console.log(`You have chosen ${selectableElements[index].name}`)
        }

    });




}


const createSelectableItem = (id) => {
    return {
        name: id,
        selected: false
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
        }
        else {
            console.log(`[] ${element.name}`)
        }
    })

}


main()