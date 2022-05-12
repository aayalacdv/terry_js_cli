const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    emitKeypressEvents: process.stdin,
  });

process.stdin.setRawMode(true);


let red = {
    value : 'red',
    favorite: true 
}

let blue = {
    value : 'blue',
    favorite: false
}

let yellow = {
    value : 'yellow',
    favorite: false
}

let index = 0
let colors = [red, blue, yellow]

        


process.stdin.on('keypress', (str, key) => {
    if (key.name === 'up') {
        index = index - 1
        require('child_process').execSync('cls', {stdio: 'inherit'});
        displayColorList()
    }
    if (key.name === 'down') {
        index = index + 1
        require('child_process').execSync('cls', {stdio: 'inherit'});
        displayColorList()
    }
    if (key.name === 'return') {
        console.log(`You have chosen ${colors[index].value}`)
    }

});



const displayColorList = () => {

    colors.map((color, i) => {
        if (index === i) {
            color.favorite = true
        }else{
            color.favorite = false 
        }

    })
    console.log('These are the colors')
    colors.forEach((color) => {
        if( color.favorite == true ){
            console.log(`[*] ${color.value}`)
        } 
        else{
            console.log(`[ ] ${color.value}`)
        }
    })

}

console.log('Press any key')

// readline.question("PICK A COLOUR \n",(name) => {
//     console.log(`Hello ${name}`); 
//     readline.close();
// })

