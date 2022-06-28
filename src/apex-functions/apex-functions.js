


export const spliceFibersToCable = async (apex, args) => {


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
        //move to the appropiate location taking into account the splice index (selected is the element id)


    }, args);


}




export const slitterFibers = async (apex, args) => {

    await apex.evaluate((args) => {

        const sliter = "xxxx-8788-f90c2b03-476836c6-b02fce34"

        const cableElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === args.cable);
        const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === args.root);


        rootElement.forEach((fiber, index) => {
            if (fiber.conexions.length == 0 && !fiber.reserved_b) {
                interconexionsIU.interconexions.doNewConexio(rootElement[index], cableElement[index], sliter, "", "", () => { });
            }
        })

        const slitterConnector = interconexionsIU.interconexions.objs.filter((obj) => obj.name === args.cable)[0];

        const { x, y } = interconexionsIU.interconexions.objs.filter((obj) => obj.name === args.root)[0].rect;
        const { h, w } = slitterConnector.rect

        const xPos = x - 300
        const yPos = y

        slitterConnector.rect.setPos(xPos, yPos, xPos + w, yPos + h)

        const positionElements = (root) => {

            const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === root);


            let verticalOffset = 0
            let horizontalOffset = 1000
            const splice = "xxxx-f5c5-be993402-9bd8c513-85ba2423"

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


            })

        }

        positionElements(args.root);
        const spls = interconexionsIU.interconexions.objs.filter((obj) => obj instanceof Icx_Splitter)
        if (spls.length != 0) {
            const splRect = interconexionsIU.interconexions.objs.filter((obj) => obj instanceof Icx_Splitter)[0].rect
            const clientsRect = interconexionsIU.interconexions.objs.filter((obj) => obj instanceof Icx_DistributionPoint)[0].rect

            if (clientsRect !== undefined) {
                const clientX = splRect.x + 200
                const clientY = splRect.y + 300
                clientsRect.setPos(clientX, clientY, clientX + clientsRect.w, clientsRect.h + clientY)
            }

        }

    }, args);

}



export const reserveFibersOnRoot = async (apex, args) => {

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
        const id = window.location.href.split('=')[1]
        Interconexions_saveUI(id, () => { })


    }, args);
}


export const spliceFromMOStoSAT = (apex, args) => {

    apex.evaluate((args) => {
        //get the port for the splitter 
        const PORTS_SPLS = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Splitter && Number.isInteger(obj.name))


        const targetId = args.target
        const target = c1 = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === targetId)


        //get a number representign the number of fibers
        const fibers = args.fibers

        const reserveFibers = (id, limit) => {

            const fibers = Icx_Connector.objects.filter(obj => obj.pare.name == id)

            for (let i = 0; i < limit; i = i + 1) {
                let updated = fibers[i].element;
                updated.reserved_b = true;
                Icx_Interconexions.prototype.doUpdateFiber(updated, () => { });
            }
        }



        const spliceFromSPLtoCable = (limit, cable, spls) => {

            for (let i = 0; i < limit; i = i + 1) {
                interconexionsIU.interconexions.doNewConexio(cable[i], spls[i], "xxxx-f5c5-be993402-9bd8c513-85ba2423", "", "", () => { });
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
        clientsRect.setPos(clientX, clientY, clientX + clientsRect.w, clientsRect.h + clientY)



    }, args)
}

