// ==UserScript==
// @name         Highlight My Points
// @namespace    bl4ckscor3
// @version      1.1
// @description  Highlights EyeWire chat messages announcing points the current user has earned.
// @author       bl4ckscor3
// @match        https://eyewire.org/
// @grant        none
// @updateURL   https://raw.githubusercontent.com/bl4ckscor3/HighlightMyPoints/master/highlightmypoints.user.js
// @downloadURL https://raw.githubusercontent.com/bl4ckscor3/HighlightMyPoints/master/highlightmypoints.user.js
// @homepageURL https://github.com/bl4ckscor3/HighlightMyPoints
// ==/UserScript==

(function() {
    'use strict';

    var acc = document.getElementById("acc").innerText; //the account name
    const color = "#461b1b"; //the highlight color
    const elementMarked = "highlighterMarked";
    const accUpdate = setInterval(updateName, 1000); //find the account name so the correct messages can be highlighted
    const highlightStyle = document.createElement("style");
    var messageCount = 0;

    highlightStyle.innerHTML = "." + elementMarked + " > .dialogNobody {background-color:" + color +"}"; //css for highlighting messages
    document.head.appendChild(highlightStyle); //add the style tag containing the highlight css to the head
    setInterval(highlightMessages, 500); //set an interval for the highlightMessages function so it can, well, highlight messages

    function highlightMessages() {
        if(acc) {
            var chatMsgs = document.getElementsByClassName("chatMsg"); //get all chat messages

            if(messageCount < chatMsgs.length) { //only loop if there are new chat messages
                for(var i = messageCount; i < chatMsgs.length; i++) { //loop through the messages that have not been checked before
                    var msg = chatMsgs.item(i);

                    if(msg.innerText.trim().startsWith(acc + " ")) { //if the first word of the chat message is the account name...
                        msg.classList.add(elementMarked); //...mark the element so it can be highlighted
                    }
                }

                messageCount = chatMsgs.length; //remember the index of the last checked message, so already checked messages don't get checked again
            }
        }
    }

    function updateName() { //needed because the name loads in a little after this script loads
        if(!acc) { //account name has not been found yet, try to find it
            acc = document.getElementById("acc").innerText.trim();
        } else {
            clearInterval(accUpdate); //account name has been found, stop calling this function
        }
    }
})();