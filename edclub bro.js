// ==UserScript==
// @name         TypingClub Bro
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically types for you on TypingClub
// @author       Your Name
// @match        *://*.edclub.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Check if the current URL contains '.play'
    if (!window.location.href.includes('.play')) {
        return; // Exit if the condition is not met
    }

    const minDelay = 60;
    const maxDelay = 100;

    const keyOverrides = {
        [String.fromCharCode(160)]: ' ' // Convert hard space to normal space
    };

    function getTargetCharacters() {
        const els = Array.from(document.querySelectorAll('.token span.token_unit'));
        return els.map(el => {
            if (el.firstChild?.classList?.contains('_enter')) {
                return '\n'; // Special case: ENTER
            }
            return keyOverrides[el.textContent[0]] || el.textContent[0];
        });
    }

    function recordKey(chr) {
        if (window.core && window.core.record_keydown_time) {
            window.core.record_keydown_time(chr);
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function autoPlay(finish) {
        const chrs = getTargetCharacters();
        if (chrs.length === 0) {
            return; // Exit if there are no characters
        }
        for (let i = 0; i < chrs.length - (!finish); i++) {
            recordKey(chrs[i]);
            await sleep(Math.random() * (maxDelay - minDelay) + minDelay);
        }
    }

    const observer = new MutationObserver(() => {
        const chrs = getTargetCharacters();
        if (chrs.length > 0) {
            observer.disconnect(); // Stop observing once we have characters
            autoPlay(true);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
