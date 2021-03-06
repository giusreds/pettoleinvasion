// (c)2020 Giuseppe Rossi

// URL GitHub
const gh_url = "giusreds";
// URL Itch-Embed
const request_url = "https://script.google.com/macros/s/AKfycbyz7DqZ3qcBK8iPapgz9TasNKF0WTsJhP9ssTu4Tnr9k9z_-ycItRga/exec";
const game_id = "3092059";
// Storage
const storage_name = "Pettole_token";
const audio_name = "Pettole_audio";
var tempStorage = null;
var audio = 1;

// Se la pagina e' caricata da GitHub, 
// carico il gioco dal CDN di itch.io
$(document).ready(function () {
    // Imposto la sorgente dell'iframe
    if (window.location.href.includes(gh_url))
        getSrc().then((ifrSrc) => {
            addSrc(ifrSrc);
        }, () => {
            console.log("error");
            location.reload();
        });
    else
        addSrc('');
});
function getSrc() {
    return new Promise((resolve, reject) => {
        // Ottengo l'URL del gioco e lo memorizzo in un cookie
        $.ajax({
            url: request_url,
            type: 'GET',
            crossDomain: true,
            data: { "id": game_id },
            success: function (data) {
                var newUrl = data.replace("index.html", "");
                Cookies.set('pettole-origin', newUrl, { expires: 120, path: '' });
                resolve(newUrl);
            },
            error: function () {
                console.log("Errore di connessione");
                if (Cookies.get('pettole-origin'))
                    resolve(Cookies.get('pettole-origin'));
                else
                    reject();
            }
        });
    });
}
// Aggiunge sorgenti iframe
function addSrc(baseUrl) {
    $("#game").attr("src", baseUrl + "resources/game/index.html");
    setTimeout(function () {
        $("#loginfr").attr("src", baseUrl + "resources/login.html");
        $("#leaderb").attr("src", baseUrl + "resources/leaderboard.html");
    }, 200);
}

// Registrazione Service Worker
$(document).ready(function () {
    if (window.location.href.includes(gh_url))
        if ('serviceWorker' in navigator) {
            // Path che contiene il service worker
            navigator.serviceWorker.register('sw.js').then(function (registration) {
                console.log('Service worker installato correttamente, scope:', registration.scope);
            }).catch(function (error) {
                console.log('Installazione service worker fallita:', error);
            });
        }
});

// Adatta la finestra di gioco
function setSize() {
    if (navigator.standalone === true) return;
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var iw = (iOS) ? document.documentElement.clientWidth : window.innerWidth;
    var ih = (iOS) ? document.documentElement.clientHeight : window.innerHeight;
    $("body").css("--vw", iw / 100 + "px");
    $("body").css("--vh", ih / 100 + "px");
}
$(document).ready(setSize);
$(window).resize(setSize);

// Resize
/*
function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
$(document).ready(setVh);
$(window).resize(setVh);
*/

// Nasconde splash screen con transizione
function removeSplash() {
    if ($("#loading").is(":visible")) {
        window.parent.postMessage('loaded', '*');
        $("#blackb").fadeIn(500, function () {
            $("#loading").hide();
            sendSafeArea();
            sendAudio();
            $("#blackb").fadeOut(500, function () {
                $("#game").focus();
            });
        });
    }
}
function sendSafeArea() {
    var sat = $(":root").css("--sat").replace(/[^0-9\.]+/g, '');
    var msgSat = JSON.stringify({
        "name": "safeArea",
        "value": parseInt(sat)
    });
    $("#game")[0].contentWindow.postMessage(msgSat, '*');
}

function wait(millisecondi) {
    var start = new Date().getTime();
    // Massimo 30 secondi
    for (var i = 0; i < 30000; i++) {
        if ((new Date().getTime() - start) > millisecondi) break;
    }
}


// Log the webpage origin on document load
$(document).ready(function () {
    console.log("pettole-origin: " + window.location.href);
});

//document.getElementById("game").addEventListener('load', removeSplash);
/*
$("#game").on('load', function () {
    let doc = $("#game")[0].contentDocument;
    var nespath = window.location.href.replace("index.html", "assets/css/nes.css");
    doc.head.innerHTML += "<link rel=\"stylesheet\" href=\"" + nespath + "\" type=\"text/css\">";
});
*/

// Prevent unload
/*
window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = null;
});
*/

// Apertura e chiusura frame
$(document).ready(function () {
    $("#login").hide();
    $("#leaderboard").hide();
});
function chiudiReadme() {
    $("#readme").slideUp();
    $("#game").focus();
}
function apriReadme() {
    $("#readme").slideDown();
}
function apriLeaderboard() {
    $("#leaderboard").show();
    $("#leaderboard").addClass("visible");
    $("#blackb").fadeIn();
    $("#leaderb")[0].contentWindow.postMessage('{"name":"sync"}', '*');
}
function chiudiLeaderboard() {
    $("#leaderboard").removeClass("visible");
    $("#blackb").fadeOut();
    $("#leaderboard").on("transitionend", function () {
        $("#leaderboard").off("transitionend");
        $('#leaderb').attr('src', $('#leaderb').attr('src'));
        $("#leaderboard").hide();
        $("#game").focus();
    });
}
function apriLogin() {
    $("#blackb").fadeIn();
    $("#login").show();
    // $("#login").css("maxWidth", $(".embed-responsive").first().css("width"));
    $("#login").addClass("visible");
    $("#loginfr")[0].contentWindow.postMessage('{"name":"load"}', '*');
}
function chiudiLogin() {
    $("#login").removeClass("visible");
    $("#blackb").fadeOut();
    $("#login").on("transitionend", function () {
        $("#login").off("transitionend");
        $('#loginfr').attr('src', $('#loginfr').attr('src'));
        $("#login").hide();
        $("#game").focus();
    });
}
function salvaLogin() {
    $("#game")[0].contentWindow.postMessage('{"name":"chiudiSettings2"}', '*');
    chiudiLogin();
}

/*
// Aggiungo padding per la notch
function addPadding(message) {
    var num = message.replace(/^\D+/g, '');
    $(":root").css("--sat", parseInt(num, 10) + "px");
}
*/

function fadeout_black() {
    $("#blackb").fadeIn(300);
}
function fadein_black() {
    $("#blackb").fadeOut(300);
    $("#game").focus();
}

// Gestione eventi
$(window).on("message", function (event) {
    /*
    if (event.origin !== "https://giusreds.github.io")
        return;
    */
    try {
        var message = JSON.parse(event.originalEvent.data);
        var source = event.originalEvent.source;
    } catch (e) {
        return;
    }
    switch (message.name) {
        case "settings1":
        case "settings2": setting(message.name); break;
        case "loaded": removeSplash(); break;
        case "apriLeaderboard": apriLeaderboard(); break;
        case "chiudiLeaderboard": chiudiLeaderboard(); break;
        case "fadeout-black": fadeout_black(); break;
        case "fadein-black": fadein_black(); break;
        case "apriLogin": apriLogin(); break;
        case "chiudiLogin": chiudiLogin(); break;
        case "salvaLogin": salvaLogin(); break;
        // Funzionalita storage
        case "setStorage": setStorage(message); break;
        case "getStorage": getStorage(source); break;
        case "clearStorage": clearStorage(); break;
        case "audio": setAudio(message); break;
        default: return;
    }
});

// Scrive audio
function setAudio(message) {
    audio = (message.value) ? 1 : 0;
    try {
        localStorage.setItem(audio_name, audio);
    } catch (e) { }
    sendAudio();
}
// Invia audio
function sendAudio() {
    var r = {
        "name": "audio",
        "value": audio
    };
    $("#game")[0].contentWindow.postMessage(JSON.stringify(r), "*");
}
// Scrive nella storage
function setStorage(message) {
    tempStorage = message.value;
    try {
        localStorage.setItem(storage_name, message.value);
    } catch (e) { }
    sendStorageToGame();
}
// Legge dalla storage
function getStorage(source) {
    var r = {
        "name": "storage",
        "value": tempStorage
    };
    source.postMessage(JSON.stringify(r), "*");
}
// Cancella chiave storage
function clearStorage() {
    tempStorage = null;
    try {
        localStorage.removeItem(storage_name);
    } catch (e) { }
    sendStorageToGame();
}
function sendStorageToGame() {
    var snd = JSON.stringify({
        "name": "storage",
        "value": tempStorage
    });
    $("#game")[0].contentWindow.postMessage(snd, '*');
}
// Memorizza localStorage in memoria
$(document).ready(function () {
    try {
        audio = (localStorage.getItem(audio_name)) ? localStorage.getItem(audio_name) : 1;
        tempStorage = localStorage.getItem(storage_name);
    } catch (e) {
        audio = 1;
        tempStorage = null;
    }
});
$(window).on("unload", function () {
    if (document.readyState == "complete")
        try {
            if (tempStorage)
                localStorage.setItem(storage_name, tempStorage);
            else
                localStorage.removeItem(storage_name);
        } catch (e) { }
});

//Caricamento...
$(document).ready(function () {
    var puntino = 0;
    var carTxt;
    var carInt = setInterval(function () {
        puntino = (puntino + 1) % 4;
        switch (puntino) {
            case 0: carTxt = ""; break;
            case 1: carTxt = "."; break;
            case 2: carTxt = ".."; break;
            case 3: carTxt = "..."; break;
        }
        $("#dots").text(carTxt);
        if ($("#loading").is(":hidden"))
            clearInterval(carInt);
    }, 400);
});
$(window).on("load", function () {
    $(window).on("visibilitychange", function () {
        if (document.visibilityState === "visible")
            $("#game")[0].contentWindow.focus();
        else
            $("#game")[0].contentWindow.blur();
    });
});