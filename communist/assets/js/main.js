function randomNumber(min, max) {
    const r = Math.random() * (max - min) + min;
    return Math.floor(r);
}

var i = 1;

function myLoop() {
    randomNum = randomNumber(100, 4500)
    setTimeout(function () {
        document.getElementsByTagName('h1')[2].innerHTML = "Deleting files. " + i + "% complete";
        i++;
        if (i < 101) {
            myLoop();
        }
    }, randomNum)
}

myLoop();