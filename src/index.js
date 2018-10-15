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
            result.push(Promise.resolve(callback(arr[i], i, arr)));
            }
        return Promise.all(result)
        }
}
//-----------------------------------------------

//Example 1
const usersArr = new CustomArr(users);
console.log(usersArr);//[{ id: 1, name: "Tom", region: "Ukraine" }, { id: 2, name: "Alex", region: "Ukraine" }]

usersArr.mapParallel(user => user.name).then(r => console.log(r));//["Tom", "Alex"]

//Example 2
const usersIdArr = new CustomArr(idArr);
console.log(usersIdArr);//[ 1, 2 ]

usersIdArr.mapParallel(async i => {
    return await getUserByIdWithDelay(i, users);
}).then(r => console.log(r));
//[{ id: 1, name: "Tom", region: "Ukraine" },{{ id: 2, name: "Alex", region: "Ukraine" }]


//Helping function

// Pseudo request to DB for Example 2
function getUserByIdWithDelay(id, arr) {
    let userObj = arr.find(user => user.id === id);
    return new Promise((res, rej) => {
        setTimeout(() => {
            if(userObj) {
                res(userObj);
            } else {
                rej(new Error(`Can't find user with id: ${id}`))
            }
        }, 2000)
    })
}