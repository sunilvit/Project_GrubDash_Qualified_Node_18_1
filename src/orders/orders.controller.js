const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//validate order Exists
function validateOrderExists(req, res, next){
    const {orderId} = req.params;
    const orderFound = orders.find((order) => order.id === orderId);

    if(orderFound){
        res.locals.order = orderFound;
        next();
    }else {
        next({
            status: 404,
            message: `order with Id: ${orderId} not found.`
        })
    }
}

//validate property is not missing and not empty
function validateOrderProperty(propertyName){
    return function (req, res, next){
        const {data = {}} = req.body;
        if (data[propertyName] && data[propertyName] !== ""){
            next()
        }else {
            next({
                status: 400,
                message: `Property ${propertyName} is required`
            })
        }
    }
}

//validate Dish property of the request is not missing and is of type Array with items in it
function validateOrderDishesProperty(req, res, next){
    const {data = {}} = req.body;
    const dishes = data['dishes'];

    if (dishes && Array.isArray(dishes) && dishes.length > 0){
        next()
    }else {
        next({
            status: 400,
            message: `Property dishes should be an array of size more than 1`
        })
    }
}

//validate quantity for each dis exists, is of type Int with value > 0
function validateOrderDishesQuantityProperty(req, res, next){
    const {data = {}} = req.body;
    const dishes = data['dishes'];

    dishes.forEach((dish) => {
        if (!(dish['quantity'] && Number(dish['quantity']) > 0 && typeof (dish['quantity']) == "number")){
            next({
                status: 400,
                message: `dish with id: ${dish.id} has invalid quantity.`
            })
        }
    })
    next();
}

//validate Id in request Body matches with the URL
function validateIdMatch(req, res, next){
    const idInBody = req.body.data.id
    const {orderId} = req.params

    if(idInBody == null){
        next();
    }else if (idInBody === "" || idInBody === orderId) {
        next();
    }else{
        next({
            status: 400,
            message: `The id(${idInBody}) property isn't required, but if it is present, it must match :orderId(${orderId}) from the route`
        });
    }
}

// Validate Order status exists and it is either pending, preparing or out-for-delivery
function validateOrderStatus(req, res, next){
    const status = req.body.data.status;

    if (status && status!== "" && (status ==="pending" || status ==="preparing" || status === "out-for-delivery")){
        next();
    } else {
        next({
            status: 400,
            message: `status is required and delivered orders can't be updated`
        })
    }
}

//validate order status exists and it is pending
function validateOrderStatusForDelete(req, res, next){
    const orderFound = res.locals.order

    if (orderFound.status && orderFound.status!== "" && orderFound.status ==="pending"){
        next();
    } else {
        next({
            status: 400,
            message: `An order cannot be deleted unless it is pending`
        })
    }
}

function create(req, res, next){
    const {data} = req.body
    data['id'] = nextId();

    orders.push(data);
    res.status(201).json({data: data});
}

function list(req, res, next){
    res.json({data: orders})
}

function read(req, res, next){
    res.json({data: res.locals.order});
}

function update(req, res, next){
   let orderFound = res.locals.order;
    const {data} = req.body;
    data['id'] = orderFound.id
    orderFound = data;

    res.json({data: orderFound})
}

function destroy(req, res, next){
    const {orderId} = req.params;
    const index = orders.findIndex((order) => order.id === orderId);

    if (index > -1){
        orders.splice(index, 1);
    }
    res.sendStatus(204);
}

module.exports = {
    list,
    read: [
        validateOrderExists,
        read],
    create: [
        validateOrderProperty("deliverTo"),
        validateOrderProperty("mobileNumber"),
        validateOrderDishesProperty,
        validateOrderDishesQuantityProperty,
        create
    ],
    update: [
        validateOrderExists,
        validateOrderProperty("deliverTo"),
        validateOrderProperty("mobileNumber"),
        validateOrderDishesProperty,
        validateOrderDishesQuantityProperty,
        validateOrderStatus,
        validateIdMatch,
        update
    ],
    delete: [
        validateOrderExists,
        validateOrderStatusForDelete,
        destroy
    ]
}
