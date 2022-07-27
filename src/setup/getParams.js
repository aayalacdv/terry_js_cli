
const getIncomingCable = (cables, id) => {
    let res;
    cables.forEach(cable => {

        const destination = cable.name.split('-')[3].trim();
        if (destination === id) res = cable;

    });
    return res;
}


export const getSetupParams = async (apex) => {

    const boxId = await apex.evaluate(() => {
        return document.querySelector('.frmIntx_spElementName').textContent.split(' ')[0]
    })

    //get the cables
    const cables = await apex.evaluate(() => {

        const raw = interconexionsIU.interconexions.cables.map((cable) => JSON.stringify({
            name: cable.name,
            type: cable.colorPattern.name, 
            destId: cable.id_node_b,
            originId: cable.id_node_a
        }));
        return raw.map((cable) => JSON.parse(cable));
    });


    //get the root cable
    const root = getIncomingCable(cables, boxId)
    
    
    //get the splitters
    const args = {
        root: root.name,
    }

    const splitters = await apex.evaluate((args) => {
        const spls = interconexionsIU.interconexions.networkClients.filter(element => element instanceof Icx_Splitter);

        const rootRect = interconexionsIU.interconexions.objs.filter((obj) => obj.name === args.root)[0].rect
        rootRect.setPos(400, 100, 100 + rootRect.w, 100 + rootRect.h)

        return spls.map((element => element.name));
    }, args)

    return { root, cables, splitters}
    
}