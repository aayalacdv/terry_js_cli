



const positionElements = (root) => {

    const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === root);
    const splice = 'xxxx-f5c5-be993402-9bd8c513-85ba2423'; 
    const slitter = 'xxxx-8788-f90c2b03-476836c6-b02fce34'; 




    let verticalOffset =  0
    let horizontalOffset = 1000 

    rootElement.forEach((fiber, index) => {

        if (fiber.conexio && fiber.conexio.tipoConector === splice) {
            const conectorId = fiber.conexio.conector2.pare.name
            const conectorElement = interconexionsIU.interconexions.objs.filter((obj) => obj.name === conectorId)[0];
            const {x, y} = interconexionsIU.interconexions.objs.filter((obj) => obj.name === root)[0].rect;
            const {h, w} = conectorElement.rect

            const xPos = x + horizontalOffset
            const yPos = y - verticalOffset 
            conectorElement.rect.setPos(xPos, yPos, xPos + w, yPos + h)
            verticalOffset -= 200
            horizontalOffset -= 300 

        }

        if (fiber.conexio && fiber.conexio.tipoConector == slitter ) {
            const slitterId = fiber.conexio.conector2.pare.name
            const sitterConnector = interconexionsIU.interconexions.objs.filter((obj) => obj.name === slitterId)[0];
           
            const {x, y} = interconexionsIU.interconexions.objs.filter((obj) => obj.name === root)[0].rect;
            const {h, w} = sitterConnector.rect

            const xPos = x - 600
            const yPos = y 

            sitterConnector.rect.setPos(xPos, yPos, xPos + w, yPos + h)
            
        }
    })

} 






const test = (root) => {

    const rootElement = Icx_Connector.objects.filter((obj) => obj.pare instanceof Icx_Cable && obj.pare.name === root);
    const splice = 'xxxx-f5c5-be993402-9bd8c513-85ba2423'; 
    rootElement.reverse(); 


    let verticalOffset = 100
    let horizontalOffset = 100


    splices = []
    rootElement.forEach((fiber, index) => {

        if (fiber.conexio.ti === splice) {


        }
    })

} 