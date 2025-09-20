//voorbeeld van een object
const setup = () => {

    let event =
    {
        eventName : "Codeer WorkShop Javascript",
        date : new Date(2025, 3,18),
        locatie : "Kortrijk",
        deelnemers : ["john","Maria","Ahmed","Sophie"],

    }
    let daysTillEvent = (event.date - new Date()) / 1000/ 60/ 60/ 24;
    let output = JSON.stringify(event)
    console.log(output + daysTillEvent);
}





window.addEventListener("load", setup);