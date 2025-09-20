const setup = () => {
    let dateNow = new Date()
    let geboorteDate = new Date('2005-08-24T00:00:00.000Z')

    let Milliseconds = dateNow - geboorteDate;
    console.log(Milliseconds)
    let daysAlive = Milliseconds / 60 / 60 / 1000 / 24;

    console.log(daysAlive);

   /* in commentaar voor overzicht
   let start = new Date('2025-04-01T12:10:30');
    console.log(start);

    //dag van de week (maandag geeft 1 terug)
    console.log(start.getDay());

    //maand
    console.log(start.getMonth());

    //jaar
    console.log(start.getFullYear());

    //dag
    console.log(start.getDate());


    console.log(start.getDate() + "-"
        + (start.getMonth() + 1) + "-"
        + start.getFullYear() + " " + start.getHours()
        + ":" + start.getMinutes() + ":" + start.getSeconds());

    */

/* in commentaar voor overzicht
    let event = new Date();
    console.log("toString " +event.toString());

    console.log(event.toISOString());  //bij ISOstring wordt er geen rekeneing gehouden met de tijdzone

    console.log(event.toDateString());

    console.log(event.toTimeString());

 */
}
window.addEventListener("load", setup);