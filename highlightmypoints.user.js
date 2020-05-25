// ==UserScript==
// @name         Highlight My Points
// @namespace    bl4ckscor3
// @version      1.0
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
    const elementSeen = "highlighterSeen";
    const elementMarked = "highlighterMarked";
    const accUpdate = setInterval(updateName, 1000); //find the account name
    const highlightStyle = document.createElement("style");

    highlightStyle.innerHTML = "." + elementMarked + " > .dialogNobody {background-color:" + color +"}"; //css for highlighting messages
    document.head.appendChild(highlightStyle); //add the style tag containing the highlight css to the head
    setInterval(highlightMessages, 500); //set an interval for the highlightMessages function so it can, well, highlight messages

    function highlightMessages() {
        if(acc) {
            var chatMsgs = document.getElementsByClassName("chatMsg"); //get all chat messages

            for(var msg of chatMsgs) { //loop through them
                if(!msg.className.includes(elementSeen)) { //no need to check the message's content, it has already been checked before
                    msg.classList.add(elementSeen); //mark the chat message as seen

                    if(msg.innerText.trim().startsWith(acc)) { //if the first word of the chat message is the account name...
                        msg.classList.add(elementMarked); //...mark the element so it can be highlighted
                    }
                }
            }
        }
    }

    function updateName() { //find the account name so the correct messages can be highlighted
        if(!acc) { //account name has not been found yet, try to find it
            acc = document.getElementById("acc").innerText.trim();
        } else { //account name has been found, stop calling this function
            clearInterval(accUpdate);
        }
    }
})();
