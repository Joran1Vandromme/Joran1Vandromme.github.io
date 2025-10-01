// zorgt ervoor dat maar één “scherm” zichtbaar is door alle andere te verbergen.

export function showScreen(id) {
    //pak alle sections waarvan id begint met screen en zet vervolgens alle sections op hidden
    document.querySelectorAll('section[id^="screen-"]').forEach(s => (s.hidden = true));

    //kijkt of de screen die je meegaf bij het roepen van de functie bestaat, indien het bestaat maak je hem zichtbaar
    let el = document.getElementById(id);
    if (el) el.hidden = false;
}