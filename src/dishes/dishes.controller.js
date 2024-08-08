const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const e = require("express");

//validate property is not missing and not empty
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

//validate price is not missing and integer and greater than 0
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

//validate Id in request Body matches with the URL
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

//validate Id in the URL exists
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
    const {data} = req.body
    data['id'] = nextId();

    dishes.push(data);
    res.status(201).json({data: data})
}

function list(req, res, next){
    res.json({data: dishes})
}

function read(req, res, next){
    res.json({data: res.locals.dish});
}

function update(req, res, next){
    let dishFound = res.locals.dish;
    const {data} = req.body;
    data['id'] = dishFound.id;
    dishFound = data

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
