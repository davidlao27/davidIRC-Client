// Okay, I'm going to be honest.
// I love to document my code as I write.
// I will do that from now on, no matter the filesize.
// - davidlao <3 2022 -

// Before I proceed though, I really suggest you read
// clientside WebSocket on Javascript.

// It will help you understand the code better, and
// it's also pretty easy to use.

// The code here should be readable if
// you understand basic english and WebSockets.

var socket; // Where the WebSocket is stored

// Some functions //
function clearChatWithText(text) {
    let br = document.createElement("br");
    document.getElementById("chatbox").innerHTML = text;
    document.getElementById("chatbox").appendChild(br);
}

function appendSpace() {
    let br = document.createElement("br");
    document.getElementById("chatbox").appendChild(br);
}

function urlify(text) {
    // Dont mind the regex
    var urlRegex = /(https?:\/\/[^\s]+)/g;

    // We just return the RegEx-applied text
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '">' + url + '</a>';
    })

    // Note we dont filter end dots, commas and similar.
    // Who would do that anyways... :(
}

function chat(text) {
    let br = document.createElement("br");

    document.getElementById("chatbox").innerHTML += urlify(text);
    document.getElementById("chatbox").appendChild(br);
}

// OTHER FUNCTIONS //
function pressedKey(e) {
    if (e.keyCode == 13) {
        Send_Server();
    }
}


// Join Server //
function Join_Server() {
    if (document.getElementById("serverurl").value.startsWith("wss://")) {
        clearChatWithText("Valid URL: Connecting...");
        // Creates a client to connect to the URL //
        socket = new WebSocket(document.getElementById("serverurl").value);
    }

    socket.onopen = function (event) {
        clearChatWithText("-- Server accepted request [1/2] --");
        document.getElementById("serverurl").style.position = "absolute";
        document.getElementById("serverurl").style.visibility = "hidden";

        document.getElementById("send").style.position = "relative";
        document.getElementById("send").style.visibility = "visible";

        document.getElementById("join").style.position = "absolute";
        document.getElementById("join").style.visibility = "hidden";

        document.getElementById("leave").style.position = "relative";
        document.getElementById("leave").style.visibility = "visible";
    };

    socket.onmessage = function (event) {
        if (event.data == "200") {

            // Server is asking for auth
            socket.send("::NCONN->" + document.getElementById("username").value);

        } else if (event.data == "100") {

            // Server authorized the client correctly
            clearChatWithText(" -- Server authorized user [2/2] -- ");

        } else if (event.data.startsWith("::ANN->")) {

            //Server just sent an announcement
            chat("<b>[Server]</b> " + event.data.split("::ANN->")[1]);

        }

        else if (event.data.startsWith("::MSG/")) {

            //Server just sent an announcement
            chat("<b>[" + event.data.split("::MSG/")[1].split("::")[0] + "]</b> " + event.data.split("::MSG/")[1].split("::")[1]);
        }
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            clearChatWithText(`<b>[OK]</b> Connection closed cleanly! Refresh the page.`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            clearChatWithText('<b>[END]</b> Connection died forcefully.');
        }

        document.getElementById("serverurl").style.position = "relative";
        document.getElementById("serverurl").style.visibility = "visible";

        document.getElementById("join").style.position = "relative";
        document.getElementById("join").style.visibility = "visible";

        document.getElementById("leave").style.position = "absolute";
        document.getElementById("leave").style.visibility = "hidden";

        document.getElementById("send").style.position = "relative";
        document.getElementById("send").style.visibility = "visible";
    };

    socket.onerror = function (error) {
        clearChatWithText(`<b>[Client Error]</b> ${error.message}`);
    };
}

// Sending messages to the server; the server links our IP with our name.
function Send_Server() {
    socket.send(document.getElementById("msgbox").value);
    document.getElementById("msgbox").value = "";
}

function Leave_Server() {
    // Close correctly
    socket.close();
}