const prompt = require('prompt-sync')({ sigint: true });

const getUserInput = () => {

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

    process.send({fibers: fibers});
    
    process.exit()
}


getUserInput()