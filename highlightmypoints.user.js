// ==UserScript==
// @name         Highlight My Points
// @namespace    bl4ckscor3
// @version      1.2
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
    const chatObserver = new MutationObserver(highlightMessages);

    highlightStyle.innerHTML = "." + elementMarked + " > .dialogNobody {background-color:" + color + "}"; //css for highlighting messages
    document.head.appendChild(highlightStyle); //add the style tag containing the highlight css to the head
    chatObserver.observe(document.getElementsByClassName("chatMsgContainer")[0], { //observe changes in the element with the chatMsgContainer class
        childList: true, //but only changes to the children
        attributes: false,
        characterData: false,
        subtree: false
    });

    function highlightMessages(mutations){
        if(acc) { //only check if the account name is set
            var mutation = mutations[0];

            if(!mutation.addedNodes) { //if no node has been added, don't do anything
                return;
            }

            mutation.addedNodes.forEach(function(msg) { //for each added node (chat message)
                if(msg.innerText.trim().startsWith(acc + " ")) { //if the first word of the chat message is the account name...
                    msg.classList.add(elementMarked); //...mark the element so it can be highlighted
                }
            });
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