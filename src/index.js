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

    mapParallel(callback) { //checked by N.D.
        let result =[], arr = this;
        for (let i = 0; i < arr.length; i++) {
            result.push(callback(arr[i], i, arr));
            }
        return Promise.all(result)
    }

    someAsync(callback) { // not checked by N.D.
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
}

//Example 1 (sync)-------------------------------
const usersArr = new CustomArr(users);
console.log(usersArr);//[{ id: 1, name: "Tom", region: "Ukraine" }, { id: 2, name: "Alex", region: "Ukraine" }]

usersArr.mapParallel(user => user.name).then(r => console.log(r));//["Tom", "Alex"]
usersArr.someAsync(user => user.name === 'Alex').then(r => console.log(r));
//true

//Example 2 (async)-------------------------------
const usersIdArr = new CustomArr(idArr);
console.log(usersIdArr);//[ 1, 2 ]

usersIdArr.mapParallel(async i => {
    return await getUserByIdWithDelay(i);
}).then(r => console.log(r));
//[{ id: 1, name: "Tom", region: "Ukraine" },{{ id: 2, name: "Alex", region: "Ukraine" }]

usersIdArr.someAsync(async i => {
    const user =  await getUserByIdWithDelay(i);
    return user.name === "Tom";
}).then(r => console.log(r)); //true


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


