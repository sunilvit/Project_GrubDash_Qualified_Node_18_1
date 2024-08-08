const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const e = require("express");

function validateProperty(propertyName){
    return function (req, res, next){
        const {data = {}} = req.body
        if(data[propertyName] && data[propertyName]!== ""){
            next()
        }else {
            next({
                status: 400,
                message: `Property ${propertyName} is required`
            })
        }
    }
}

function validatePrice(req, res, next){
    const price = req.body.data.price
    if (price && Number(price) > 0 && typeof (price) == "number"){
        next()
    }else {
        next({
            status: 400,
            message: `price should be more than 0`
        })
    }
}

function validateIdMatch(req, res, next){
    const idInBody = req.body.data.id
    const {dishId} = req.params

    if(idInBody == null){
        next();
    }else if (idInBody === "" || idInBody === dishId) {
        next();
    }else{
        next({
            status: 400,
            message: `The id(${idInBody}) property isn't required, but if it is present, it must match :dishId(${dishId}) from the route`
        });
    }
}

function validateDishExists(req, res, next){
    const {dishId} = req.params;
    const dishFound = dishes.find((dish) => dish.id === dishId);

    if(dishFound){
        res.locals.dish = dishFound;
        next();
    }else {
        next({
            status: 404,
            message: `dish with Id: ${dishId} not found.`
        })
    }

}
function create(req, res, next){
    const {data: {name, description, price, image_url}} = req.body
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish})
}

function list(req, res, next){
    res.json({data: dishes})
}

function read(req, res, next){
    res.json({data: res.locals.dish});
}

function update(req, res, next){
    const dishFound = res.locals.dish;
    const {data: {name, description, price, image_url}} = req.body

    dishFound['name'] = name
    dishFound['description'] = description
    dishFound['price'] = price
    dishFound['image_url'] = image_url

    res.json({data: dishFound})
}
module.exports = {
    create: [
        validateProperty("name"),
        validateProperty("description"),
        validateProperty("price"),
        validateProperty("image_url"),
        validatePrice,
        create
    ],
    list,
    read: [
        validateDishExists,
        read],
    update: [
        validateDishExists,
        validateIdMatch,
        validateProperty("name"),
        validateProperty("description"),
        validateProperty("price"),
        validateProperty("image_url"),
        validatePrice,
        update]
}
