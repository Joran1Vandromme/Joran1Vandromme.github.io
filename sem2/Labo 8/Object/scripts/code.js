//voorbeeld van een object
const setup = () => {
    let student = {}; // een leeg object
    student.firstName = "John";
    student.lastName = "Doe";
    student.age = new Date (2000,1,1);
    student.eyeColor = "blue";

    console.log (student.firstName);
}


// kortere manier, werken met literals: key - pair values
let Student1 = {
    firstName: "John",
    lastName: "Doe",
    eyeColor: "blue",
    age: new Date(2000, 0, 1, 0, 10, 30)
}


let text = JSON.stringify(Student1);
console.log(text);


let student2 = {
    firstName: "John",
    lastName: "Doe",
    address : {
        zipCode : 8500,
        city : "Kortrijk"
    }
};

//console.log (student2.address.zipCode);



//array
let students = [
    {
        firstName: "John",
        lastName: "Doe",
        address: {
            zipCode: 8500,
            city: "Kortrijk"
        }
    },
    {
        firstName: "VIVES",
        lastName: "Doe",
        address: {
            zipCode: 8500,
            city: "Kortrijk"
        }
    }
]
let arrayText = JSON.stringify(students);
console.log(arrayText);


window.addEventListener("load", setup);