const BASE_STYLE = {
    padding: 1,
    borderStyle: 'round'
}


const getBoxenColor = (type) => {
    if (type === 'Cable 48 f.o.') {
        return { ...BASE_STYLE, backgroundColor: 'red' }
    }
    if (type === 'Cable 12 f.o.') {
        return { ...BASE_STYLE, backgroundColor: '#ffa500' }
    }

    if (type === 'splitter') {
        return { ...BASE_STYLE, backgroundColor: 'gray' }
    }
    return { ...BASE_STYLE, backgroundColor: 'yellow' }

}

export default getBoxenColor

