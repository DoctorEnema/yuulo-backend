
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
// const reviewService = require('../review/review.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    remove,
    update,
    add,
    // getByUsername,
    // addNewReview
}

async function query(filterBy = {}) {
    // TURN ON WHEN FILTERING
    // const criteria = _buildCriteria(filterBy)
    try {
       const collection = await dbService.getCollection('board')
        // TURN ON WHEN FILTERING
        // var board = await collection.find(criteria).toArray()
        var boards = await collection.find().toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = await collection.findOne({ '_id': ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ '_id': ObjectId(boardId) })
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function update(board) {
    try {
        // peek only updatable fields!
        const boardToSave = {
            _id: ObjectId(board._id),
            title: board.title,
            createdAt: board.createdAt,
            createdBy: board.createdBy,
            style: board.style,
            covers: board.covers,
            labels: board.labels,
            members: board.members,
            groups: board.groups,
            activities: board.activities,
        }
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ '_id': boardToSave._id }, { $set: boardToSave })
        return boardToSave;
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function add(board) {
    try {
        // peek only updatable fields!
        const boardToAdd = {
            title: board.title,
            createdAt: board.createdAt,
            createdBy: board.createdBy,
            style: board.style,
            covers: board.covers,
            labels: board.labels,
            members: board.members,
            groups: board.groups,
            activities: board.activities,
        }
        const collection = await dbService.getCollection('board')
        const savedBoard = await collection.insertOne(boardToAdd)
        // console.log("savedBoard", savedBoard)
        return savedBoard;
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    var criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [{ name: txtCriteria }]
        // criteria.$or = [
        //     {
        //         username: txtCriteria
        //     },
        //     {
        //         fullname: txtCriteria
        //     }
        // ]
        // criteria.$or = [
        //     {
        //         username: txtCriteria
        //     },
        //     {
        //         fullname: txtCriteria
        //     }
        // ]
    }
    // if (filterBy.minBalance) {
    //     criteria.balance = { $gte: filterBy.minBalance }
    // }
    return criteria
}


