// ==UserScript==
// @name         Highlight My Points
// @namespace    bl4ckscor3
// @version      1.4.1
// @description  Highlights EyeWire chat messages announcing points the current user has earned.
// @author       bl4ckscor3
// @match        https://eyewire.org/
// @grant        none
// @updateURL    https://raw.githubusercontent.com/bl4ckscor3/HighlightMyPoints/master/highlightmypoints.user.js
// @downloadURL  https://raw.githubusercontent.com/bl4ckscor3/HighlightMyPoints/master/highlightmypoints.user.js
// @homepageURL  https://github.com/bl4ckscor3/HighlightMyPoints
// @require      https://chrisraven.github.io/EyeWire-Custom-Highlight/spectrum.js
// ==/UserScript==

/* globals $ account */

(function() {
    'use strict';

    const checkAccount = setInterval(function() {
        if(typeof account === "undefined" || !account.account.uid) { //is the account accessible yet?
            return; //if not, try again
        }

        clearInterval(checkAccount); //if yes, stop trying and start the actual script
        main();
    }, 100);

    function main() {
        const acc = account.account.username;
        const highlightStyle = document.createElement("style");
        const chatObserver = new MutationObserver(highlightMessages);
        const settingsCheck = setInterval(initSettings, 100);
        const settings = new Map();
        const regexes = new Map();
        const colors = new Map();
        const normalRegex = new RegExp(`${acc} earned [0-9]+ points$`); //$ designates a string's ending
        const trailblazeRegex = new RegExp(`${acc} trailblazed a cube!`);
        const retroRegex = new RegExp(`${acc} earned [0-9]+ points from trailblazing`);
        const scoutRegex = new RegExp(`${acc} scouted a cube for [0-9]+ points\.?`); //not sure if this ends with a . or not, so i'm soft-requiring a dot here
        const scytheRegex = new RegExp(`${acc} scythed a cube for [0-9]+ points.`);
        const achievementRegex = new RegExp(`${acc} earned the .* achievement!`);
        const otherRegex = new RegExp(`${acc} .+`);

        highlightStyle.setAttribute("id", "highlight-my-points-style");
        document.head.appendChild(highlightStyle); //add the style tag containing the highlight css to the head
        addSpectrumCSS();
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
                    var trimmed = msg.innerText.trim();

                    if(trimmed.startsWith(acc + " ")) { //only check if the message is about the current user, doesn't make sense to check otherwise
                        for(let key of settings.keys()) { //loop through all settings
                            if(regexes.get(key).test(trimmed)) { //if the message matches the setting's regex...
                                if(settings.get(key)) { //...check if the message is enabled...
                                    msg.classList.add(key + "-marked"); //...and if so, mark the element so it can be highlighted
                                }

                                return; //if it's not enabled, stop looping through settings, otherwhise the setting for "/me"-messages will take effect
                            }
                        }
                    }
                });
            }
        }

        function initSettings() {
            if(!document.getElementById("cubeInspectorFloatingControls")) {
                return;
            }

            clearInterval(settingsCheck);

            var menu = document.getElementById("settingsMenu");
            var category = document.createElement("div");
            var isScytheOrHigher = account.can("scythe mystic admin");

            category.setAttribute("class", "settings-group ews-settings-group invisible");
            category.innerHTML = '<h1>Chat highlighting</h1><div style="font-style: italic;">Only applies to messages starting with your name.</div><div><br></div>'; //the last part exists to properly add some padding between the explanatory text and the settings
            menu.appendChild(category);
            addToggleSetting(category, "highlight-normal-points", "Highlight normal point messages", normalRegex);
            addToggleSetting(category, "highlight-trailblazes", "Highlight trailblazing messages", trailblazeRegex);
            addToggleSetting(category, "highlight-retro-points", "Highlight retro points messages", retroRegex);

            if(account.can("scout") && !isScytheOrHigher) {
               addToggleSetting(category, "highlight-scout-points", "Highlight point messages from scouting", scoutRegex);
            }

            if(isScytheOrHigher) {
                addToggleSetting(category, "highlight-scythe-points", "Highlight point messages from reaping", scytheRegex);
            }

            addToggleSetting(category, "highlight-achievements", "Highlight achievement messages", achievementRegex);
            addToggleSetting(category, "highlight-me", 'Highlight "/me"-messages', otherRegex);
            updateColors();
        }

        function addToggleSetting(category, id, description, regex) {
            var state = getLocalSetting(id, true);
            var setting = document.createElement("div");
            var checkbox = document.createElement("checkbox");

            setting.setAttribute("class", "setting");
            setting.innerHTML = `<span>${description}</span>`;
            checkbox.setAttribute("class", `checkbox ${state ? "on" : "off"}`);
            checkbox.innerHTML = `
                <div class="checkbox-handle"></div>
                <input type="checkbox" id="hmp-${id}" checked="${state ? "checked" : ""}" style="display: none;">`;
            setting.appendChild(checkbox);
            category.appendChild(setting);

            setting.onclick = function(e) {
                var toggle = setting.getElementsByTagName("input")[0];
                var newState = !toggle.checked;

                e.stopPropagation();
                setLocalSetting(id, newState);
                toggle.checked = newState;
                checkbox.setAttribute("class", `checkbox ${newState ? "on" : "off"}`);
                onSettingChanged(id, newState);
            };

            onSettingChanged(id, state);
            regexes.set(id, regex);
            addColorPicker(category, id);
        }

        function addColorPicker(category, id) {
            var savedColor = getLocalSetting(id + "-color", "#461b1b");
            var colorSetting = document.createElement("div");
            var colorPicker = document.createElement("input");
            var previousColor;

            colorPicker.setAttribute("id", id + "-picker");
            colorSetting.setAttribute("style", 'padding-left: 80%');
            colorSetting.appendChild(colorPicker);
            category.appendChild(colorSetting);
            colors.set(id, savedColor);

            $(`#${id}-picker`).spectrum({
                showInput: true,
                preferredFormat: "hex",
                color: savedColor,
                containerClassName: "ews-color-picker",
                replacerClassName: "ews-color-picker",
                show: function(color) {
                    previousColor = color.toHexString(); //save previous color so it can be reset if the user presses "cancel"
                },
                move: function(color) {
                    saveColor(id, color);
                },
                change: function(color) {
                    saveColor(id, color);
                }
            });

            $(".sp-cancel").click(function() {
                saveColor(id, previousColor); //reset color
            });
        }

        function saveColor(id, color) {
            setLocalSetting(id + "-color", color);
            colors.set(id, color);
            updateColors();
        }

        function updateColors() {
            var css = "";

            for(let key of colors.keys()) {
                css += `.${key}-marked > .dialogNobody {background-color: ${colors.get(key)}}`; //css for highlighting messages
            }

            highlightStyle.innerHTML = css;
        }

        function setLocalSetting(setting, value) {
            localStorage.setItem(account.account.uid + "-hmp-" + setting, value);
        }

        function getLocalSetting(setting, defaultValue) {
            var storedValue = localStorage.getItem(account.account.uid + "-hmp-" + setting);

            if(storedValue === null) {
                setLocalSetting(setting, defaultValue);
                return defaultValue;
            }
            else {
                return typeof defaultValue === "boolean" ? storedValue === "true" : storedValue;
            }
        }

        function onSettingChanged(id, state) { //trigger the ews-setting-changed event and update the lookup map with the new value
            $(document).trigger('ews-setting-changed', {setting: id, state: state});
            settings.set(id, state);
        }

        function addSpectrumCSS() {
            var link = document.createElement("link");

            link.setAttribute("href", "https://chrisraven.github.io/EyeWire-Custom-Highlight/spectrum.css?v=1");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            document.head.appendChild(link);
        }
    }
})();