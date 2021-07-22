
const fs = require('fs');

const gToys = require('../data/toy.json')

module.exports = {
    query,
    getById,
    save,
    remove
}

function query(filterBy) {
    const regex = new RegExp(filterBy.txt)
    var toysToSend = gToys.filter(toy => regex.test(toy.name))
        .filter(toy => {
            if (filterBy.inStock === "All") return toy
            else if (filterBy.inStock === "In stock") return toy.inStock
            else if (filterBy.inStock === "Not available") return !toy.inStock
        }).filter(toy => 
            toy.type ===  filterBy.type || filterBy.type === 'All'
            // if (filterBy.type === "All") return toy
            // else if (filterBy.type === "Funny") return toy.type === "Funny"
            // else if (filterBy.type === "Adult") return toy.type === "Adult"
            // else if (filterBy.type === "Educational") return toy.type === "Educational"
        )

    if (filterBy.sortBy === 'Name') return Promise.resolve(toysToSend.sort((a, b) => a.name.localeCompare(b.name)))
    else if (filterBy.sortBy === 'Price') return Promise.resolve(toysToSend.sort((a, b) => a.price - b.price))
    else return Promise.resolve(toysToSend)
}

function getById(toyId) {
    var toy = gToys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function save(toyToSave) {
    const { name, price, type, createdAt, inStock } = toyToSave
    const toy = {
        _id: toyToSave._id || _makeId(),
        name,
        price,
        type,
        createdAt,
        inStock

    }
    if (toyToSave._id) {
        const idx = gToys.findIndex(toy => toy._id === toyToSave._id)
        if (idx === -1) return Promise.reject('Cannot Update toy');
        gToys[idx] = toy
    } else {
        gToys.unshift(toy)
    }
    return _saveToysToFile().then(() => {
        return toy
    })
}

function remove(toyId) {

    var idx = gToys.findIndex(toy => toy._id === toyId)
    if (idx >= 0) {
        gToys.splice(idx, 1)
        return _saveToysToFile()
    }
    return Promise.reject('not your toy' + toyId)
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile('data/toy.json', JSON.stringify(gToys, null, 2), (err) => {
            if (err) return reject(err)
            resolve();
        })
    })
}

function _makeId(length = 5) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var txt = '';
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}