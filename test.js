//get the port for the splitter 
const PORTS_SPLS = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Splitter && Number.isInteger(obj.name))


const targetId = "BRK-CL008-SB48022-SB48023"
const target = c1 = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === targetId )


//get a number representign the number of fibers
const fibers = 3

const reserveFibers = (id, limit) => {

    const fibers = Icx_Connector.objects.filter(obj => obj.pare.name == id)

    for (let i = 0; i < limit; i = i +1){
        let updated = fibers[i].element;
        updated.reserved_b = true;
        Icx_Interconexions.prototype.doUpdateFiber(updated, () => { });
    }
}



const spliceFromSPLtoCable= (limit, cable, spls) => { 
        
	for( let i = 0; i < limit; i=i+1) { 
		interconexionsIU.interconexions.doNewConexio(cable[i], spls[i], "xxxx-f5c5-be993402-9bd8c513-85ba2423", "", "", () => {}); 
}
}



spliceFromSPLtoCable(fibers, target, PORTS_SPLS)
reserveFibers(targetId, fibers)

const splRect = interconexionsIU.interconexions.objs.filter((obj) => obj instanceof Icx_Splitter)[0].rect
const targetRect = interconexionsIU.interconexions.objs.filter((obj) => obj.name === targetId)[0].rect;

const xPos = splRect.x + 650 
const yPos = splRect.y
targetRect.setPos(xPos, yPos, xPos + targetRect.w, yPos + targetRect.h)

const clientsRect = interconexionsIU.interconexions.objs.filter((obj) => obj instanceof Icx_DistributionPoint)[0].rect 
const clientX = splRect.x + 200
const clientY = splRect.y + 300
clientsRect.setPos( clientX, clientY, clientX + clientsRect.w , clientsRect.h + clientY)

