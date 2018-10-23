const users = [
    {
        id: 1,
        name: 'Tom',
        region: 'Ukraine'
    },
    {
        id: 2,
        name: 'Alex',
        region: 'Ukraine'
    }
];

const idArr = [1, 2];

//------------------------------------
class CustomArr extends Array {
    constructor(arr) {
        super(...arr);
    }

    mapParallel(callback) {
        let result =[], arr = this;
        for (let i = 0; i < arr.length; i++) {
            result.push(callback(arr[i], i, arr));
        }
        return Promise.all(result)
    }

    someParallel(callback) {
        let result = [], arr = this;
        for (let i = 0; i < arr.length; i++) {
            result.push(callback(arr[i], i, arr));
        }
        return Promise.all(result).then(users => {
            let bool = false;
            for (let i = 0; i < users.length; i++) {
                if(users[i]) {
                    bool = true;
                    break;
                }
            }
            return bool;
        });
    }

    filterSeries(callback) {
        let result = [];
        return this.reduce((promise, item, index, arr) => {
            return promise
                .then(() => callback(item, index, arr))
                .then((r) => {
                    if(r) {
                        result.push(item)
                    }
                });
        }, Promise.resolve()).then(() => console.log(result))
    }

    someSeries(callback) {
        let bool = false;
        return this.reduce((promise, item, index, arr) => {
            return promise
                .then(() => callback(item, index, arr))
                .then((r) => {
                    if(r) {
                        return bool = true;
                    }
                });
        }, Promise.resolve()).then(() => console.log(bool))
    }

    mapSeries(callback) {
        let result = [];
        return this.reduce((promise, item, index, arr) => {
            return promise
                .then(() => callback(item, index, arr))
                .then((r) => {
                    result.push(r);
                })
        }, Promise.resolve()).then(() => console.log(result))
    }
}

//Example 1 (sync)-------------------------------
const usersArr = new CustomArr(users);

console.log(usersArr);//[{ id: 1, name: "Tom", region: "Ukraine" }, { id: 2, name: "Alex", region: "Ukraine" }]

usersArr.mapParallel(user => user.name).then(r => console.log(r));//["Tom", "Alex"]

usersArr.someParallel(user => user.name === 'Alex').then(r => console.log(r));
//true

usersArr.filterSeries(user => user.name === 'Alex');
//{ id: 2, name: "Alex", region: "Ukraine" }

usersArr.someSeries(user => user.name === "Alex"); //true
usersArr.someSeries(user => user.name === "Trump"); //false

usersArr.mapSeries(user => user.name); //[ "Tom", "Alex" ]

//------------------------------------------------
//Example 2 (async)-------------------------------
const usersIdArr = new CustomArr(idArr);
console.log(usersIdArr);//[ 1, 2 ]

usersIdArr.mapParallel(async i => {
    return await getUserByIdWithDelay(i);
}).then(r => console.log(r));
//[{ id: 1, name: "Tom", region: "Ukraine" },{{ id: 2, name: "Alex", region: "Ukraine" }]

usersIdArr.someParallel(async i => {
    const user =  await getUserByIdWithDelay(i);
    return user.name === "Tom";
}).then(r => console.log(r)); //true

usersIdArr.filterSeries(async i => {
    const user = await getUserByIdWithDelay(i);
    return user.name === 'Alex'
}); // [2]

usersIdArr.someSeries(async i => {
    const user = await getUserByIdWithDelay(i);
    return user.name === 'Tom'
}); // true

usersIdArr.mapSeries(async i => {
    const user = await getUserByIdWithDelay(i);
    return user.region;
}); // [ "Ukraine", "Ukraine" ]

//Helping function

// Pseudo request to DB for Example 2
function getUserByIdWithDelay(id) {
    let userObj = users.find(user => user.id === id);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(userObj) {
                resolve(userObj);
            } else {
                reject(new Error(`Can't find user with id: ${id}`))
            }
        }, 2000)
    })
}

//-------------------------------
