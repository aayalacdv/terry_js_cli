fibers.forEach((fiber) => {
    let updated = fiber.element; 
    updated.reserved_a = true;  
    Icx_Interconexions.prototype.doUpdateFiber(updated, () => {}); 
})



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