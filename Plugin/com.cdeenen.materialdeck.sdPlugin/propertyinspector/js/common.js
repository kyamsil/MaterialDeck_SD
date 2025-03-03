/* global $SD, $localizedStrings */
/* exported, $localizedStrings */
/* eslint no-undef: "error",
  curly: 0,
  no-caller: 0,
  wrap-iife: 0,
  one-var: 0,
  no-var: 0,
  vars-on-top: 0
*/
const debugEn = false;
if (debugEn) console.log("starting common.js")

// don't change this to let or const, because we rely on var's hoisting
// eslint-disable-next-line no-use-before-define, no-var
var $localizedStrings = $localizedStrings || {},
    REMOTESETTINGS = REMOTESETTINGS || {},
    DestinationEnum = Object.freeze({
        HARDWARE_AND_SOFTWARE: 0,
        HARDWARE_ONLY: 1,
        SOFTWARE_ONLY: 2
    }),
    // eslint-disable-next-line no-unused-vars
    isQT = navigator.appVersion.includes('QtWebEngine'),
    debug = debug || false,
    debugLog = function () {},
    MIMAGECACHE = MIMAGECACHE || {};

const setDebugOutput = (debug) => (debug === true) ? console.log.bind(window.console) : function () {};
debugLog = setDebugOutput(debug);

// Create a wrapper to allow passing JSON to the socket
WebSocket.prototype.sendJSON = function (jsn, log) {
    if (log) {
        if (debugEn) console.log('SendJSON', this, jsn);
    }
    // if (this.readyState) {
    this.send(JSON.stringify(jsn));
    // }
};

/* eslint no-extend-native: ["error", { "exceptions": ["String"] }] */
String.prototype.lox = function () {
    var a = String(this);
    try {
        a = $localizedStrings[a] || a;
    } catch (b) {}
    return a;
};

String.prototype.sprintf = function (inArr) {
    let i = 0;
    const args = (inArr && Array.isArray(inArr)) ? inArr : arguments;
    return this.replace(/%s/g, function () {
        return args[i++];
    });
};

// eslint-disable-next-line no-unused-vars
const sprintf = (s, ...args) => {
    let i = 0;
    return s.replace(/%s/g, function () {
        return args[i++];
    });
};

const loadLocalization = (lang, pathPrefix, cb) => {
    Utils.readJson(`${pathPrefix}${lang}.json`, function (jsn) {
        const manifest = Utils.parseJson(jsn);
        $localizedStrings = manifest && manifest.hasOwnProperty('Localization') ? manifest['Localization'] : {};
        debugLog($localizedStrings);
        if (cb && typeof cb === 'function') cb();
    });
}

var Utils = {
    sleep: function (milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    },
    isUndefined: function (value) {
        return typeof value === 'undefined';
    },
    isObject: function (o) {
        return (
            typeof o === 'object' &&
            o !== null &&
            o.constructor &&
            o.constructor === Object
        );
    },
    isPlainObject: function (o) {
        return (
            typeof o === 'object' &&
            o !== null &&
            o.constructor &&
            o.constructor === Object
        );
    },
    isArray: function (value) {
        return Array.isArray(value);
    },
    isNumber: function (value) {
        return typeof value === 'number' && value !== null;
    },
    isInteger (value) {
        return typeof value === 'number' && value === Number(value);
    },
    isString (value) {
        return typeof value === 'string';
    },
    isImage (value) {
        return value instanceof HTMLImageElement;
    },
    isCanvas (value) {
        return value instanceof HTMLCanvasElement;
    },
    isValue: function (value) {
        return !this.isObject(value) && !this.isArray(value);
    },
    isNull: function (value) {
        return value === null;
    },
    toInteger: function (value) {
        const INFINITY = 1 / 0,
            MAX_INTEGER = 1.7976931348623157e308;
        if (!value) {
            return value === 0 ? value : 0;
        }
        value = Number(value);
        if (value === INFINITY || value === -INFINITY) {
            const sign = value < 0 ? -1 : 1;
            return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
    }
};
Utils.minmax = function (v, min = 0, max = 100) {
    return Math.min(max, Math.max(min, v));
};

Utils.rangeToPercent = function (value, min, max) {
    return ((value - min) / (max - min));
};

Utils.percentToRange = function (percent, min, max) {
    return ((max - min) * percent + min);
};

Utils.setDebugOutput = (debug) => {
    return (debug === true) ? console.log.bind(window.console) : function () {};
};

Utils.randomComponentName = function (len = 6) {
    return `${Utils.randomLowerString(len)}-${Utils.randomLowerString(len)}`;
};

Utils.randomString = function (len = 8) {
    return Array.apply(0, Array(len))
        .map(function () {
            return (function (charset) {
                return charset.charAt(
                    Math.floor(Math.random() * charset.length)
                );
            })(
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            );
        })
        .join('');
};

Utils.rs = function (len = 8) {
    return [...Array(len)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
};

Utils.randomLowerString = function (len = 8) {
    return Array.apply(0, Array(len))
        .map(function () {
            return (function (charset) {
                return charset.charAt(
                    Math.floor(Math.random() * charset.length)
                );
            })('abcdefghijklmnopqrstuvwxyz');
        })
        .join('');
};

Utils.capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

Utils.measureText = (text, font) => {
    const canvas = Utils.measureText.canvas || (Utils.measureText.canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    ctx.font = font || 'bold 10pt system-ui';
    return ctx.measureText(text).width;
};

Utils.fixName = (d, dName) => {
    let i = 1;
    const base = dName;
    while (d[dName]) {
        dName = `${base} (${i})`
        i++;
    }
    return dName;
};

Utils.isEmptyString = (str) => {
    return (!str || str.length === 0);
};

Utils.isBlankString = (str) => {
    return (!str || /^\s*$/.test(str));
};

Utils.log = function () {};
Utils.count = 0;
Utils.counter = function () {
    return (this.count += 1);
};
Utils.getPrefix = function () {
    return this.prefix + this.counter();
};

Utils.prefix = Utils.randomString() + '_';

Utils.getUrlParameter = function (name) {
    const nameA = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + nameA + '=([^&#]*)');
    const results = regex.exec(location.search.replace(/\/$/, ''));
    return results === null
        ? null
        : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

Utils.debounce = function (func, wait = 100) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
};

Utils.getRandomColor = function () {
    return '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, 0); // just a random color padded to 6 characters
};

/*
    Quick utility to lighten or darken a color (doesn't take color-drifting, etc. into account)
    Usage:
    fadeColor('#061261', 100); // will lighten the color
    fadeColor('#200867'), -100); // will darken the color
*/

Utils.fadeColor = function (col, amt) {
    const min = Math.min, max = Math.max;
    const num = parseInt(col.replace(/#/g, ''), 16);
    const r = min(255, max((num >> 16) + amt, 0));
    const g = min(255, max((num & 0x0000FF) + amt, 0));
    const b = min(255, max(((num >> 8) & 0x00FF) + amt, 0));
    return '#' + (g | (b << 8) | (r << 16)).toString(16).padStart(6, 0);
}

Utils.lerpColor = function (startColor, targetColor, amount) {
    const ah = parseInt(startColor.replace(/#/g, ''), 16);
    const ar = ah >> 16;
    const ag = (ah >> 8) & 0xff;
    const ab = ah & 0xff;
    const bh = parseInt(targetColor.replace(/#/g, ''), 16);
    const br = bh >> 16;
    var bg = (bh >> 8) & 0xff;
    var bb = bh & 0xff;
    const rr = ar + amount * (br - ar);
    const rg = ag + amount * (bg - ag);
    const rb = ab + amount * (bb - ab);

    return (
        '#' +
        (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0)
            .toString(16)
            .slice(1)
            .toUpperCase()
    );
};

Utils.hexToRgb = function (hex) {
    const match = hex.replace(/#/, '').match(/.{1,2}/g);
    return {
        r: parseInt(match[0], 16),
        g: parseInt(match[1], 16),
        b: parseInt(match[2], 16)
    };
};

Utils.rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    return x.toString(16).padStart(2,0)
}).join('')


Utils.nscolorToRgb = function (rP, gP, bP) {
    return {
        r : Math.round(rP * 255),
        g : Math.round(gP * 255),
        b : Math.round(bP * 255)
    }
};

Utils.nsColorToHex = function (rP, gP, bP) {
    const c = Utils.nscolorToRgb(rP, gP, bP);
    return Utils.rgbToHex(c.r, c.g, c.b);
};

Utils.miredToKelvin = function (mired) {
    return Math.round(1e6 / mired);
};

Utils.kelvinToMired = function (kelvin, roundTo) {
    return roundTo ? Utils.roundBy(Math.round(1e6 / kelvin), roundTo) : Math.round(1e6 / kelvin);
};

Utils.roundBy = function(num, x) {
    return Math.round((num - 10) / x) * x;
}

Utils.getBrightness = function (hexColor) {
    // http://www.w3.org/TR/AERT#color-contrast
    if (typeof hexColor === 'string' && hexColor.charAt(0) === '#') {
        var rgb = Utils.hexToRgb(hexColor);
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    }
    return 0;
};

Utils.readJson = function (file, callback) {
    var req = new XMLHttpRequest();
    req.onerror = function (e) {
        // Utils.log(`[Utils][readJson] Error while trying to read  ${file}`, e);
    };
    req.overrideMimeType('application/json');
    req.open('GET', file, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            // && req.status == "200") {
            if (callback) callback(req.responseText);
        }
    };
    req.send(null);
};

Utils.loadScript = function (url, callback) {
    const el = document.createElement('script');
    el.src = url;
    el.onload = function () {
        callback(url, true);
    };
    el.onerror = function () {
        console.error('Failed to load file: ' + url);
        callback(url, false);
    };
    document.body.appendChild(el);
};

Utils.parseJson = function (jsonString) {
    if (typeof jsonString === 'object') return jsonString;
    try {
        const o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object",
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === 'object') {
            return o;
        }
    } catch (e) {}

    return false;
};

Utils.parseJSONPromise = function (jsonString) {
    // fetch('/my-json-doc-as-string')
    // .then(Utils.parseJSONPromise)
    // .then(heresYourValidJSON)
    // .catch(error - or return default JSON)

    return new Promise((resolve, reject) => {
        try {
            resolve(JSON.parse(jsonString));
        } catch (e) {
            reject(e);
        }
    });
};

/* eslint-disable import/prefer-default-export */
Utils.getProperty = function (obj, dotSeparatedKeys, defaultValue) {
    if (arguments.length > 1 && typeof dotSeparatedKeys !== 'string')
        return undefined;
    if (typeof obj !== 'undefined' && typeof dotSeparatedKeys === 'string') {
        const pathArr = dotSeparatedKeys.split('.');
        pathArr.forEach((key, idx, arr) => {
            if (typeof key === 'string' && key.includes('[')) {
                try {
                    // extract the array index as string
                    const pos = /\[([^)]+)\]/.exec(key)[1];
                    // get the index string length (i.e. '21'.length === 2)
                    const posLen = pos.length;
                    arr.splice(idx + 1, 0, Number(pos));

                    // keep the key (array name) without the index comprehension:
                    // (i.e. key without [] (string of length 2)
                    // and the length of the index (posLen))
                    arr[idx] = key.slice(0, -2 - posLen); // eslint-disable-line no-param-reassign
                } catch (e) {
                    // do nothing
                }
            }
        });
        // eslint-disable-next-line no-param-reassign, no-confusing-arrow
        obj = pathArr.reduce(
            (o, key) => (o && o[key] !== 'undefined' ? o[key] : undefined),
            obj
        );
    }
    return obj === undefined ? defaultValue : obj;
};

Utils.getProp = (jsn, str, defaultValue = {}, sep = '.') => {
    const arr = str.split(sep);
    return arr.reduce((obj, key) =>
        (obj && obj.hasOwnProperty(key)) ? obj[key] : defaultValue, jsn);
};

Utils.setProp = function (jsonObj, path, value) {
    const names = path.split('.');
    let jsn = jsonObj;

    // createNestedObject(jsn, names, values);
    // If a value is given, remove the last name and keep it for later:
    var targetProperty = arguments.length === 3 ? names.pop() : false;

    // Walk the hierarchy, creating new objects where needed.
    // If the lastName was removed, then the last object is not set yet:
    for (var i = 0; i < names.length; i++) {
        jsn = jsn[names[i]] = jsn[names[i]] || {};
    }

    // If a value was given, set it to the target property (the last one):
    if (targetProperty) jsn = jsn[targetProperty] = value;

    // Return the last object in the hierarchy:
    return jsn;
};

Utils.getDataUri = function (url, callback, inCanvas, inFillcolor) {
    var image = new Image();

    image.onload = function () {
        const canvas =
            inCanvas && Utils.isCanvas(inCanvas)
                ? inCanvas
                : document.createElement('canvas');

        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        const ctx = canvas.getContext('2d');
        if (inFillcolor) {
            ctx.fillStyle = inFillcolor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(this, 0, 0);
        // Get raw image data
        // callback && callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

        // ... or get as Data URI
        callback(canvas.toDataURL('image/png'));
    };

    image.src = url;
};

/** Quick utility to inject a style to the DOM
* e.g. injectStyle('.localbody { background-color: green;}')
*/
Utils.injectStyle = function (styles, styleId) {
   const node = document.createElement('style');
   const tempID = styleId || Utils.randomString(8);
   node.setAttribute('id', tempID);
   node.innerHTML = styles;
   document.body.appendChild(node);
   return node;
};


Utils.loadImage = function (inUrl, callback, inCanvas, inFillcolor) {
    /** Convert to array, so we may load multiple images at once */
    const aUrl = !Array.isArray(inUrl) ? [inUrl] : inUrl;
    const canvas = inCanvas && inCanvas instanceof HTMLCanvasElement
        ? inCanvas
        : document.createElement('canvas');
    var imgCount = aUrl.length - 1;
    const imgCache = {};

    var ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';

    for (let url of aUrl) {
        let image = new Image();
        let cnt = imgCount;
        let w = 144, h = 144;

        image.onload = function () {
            imgCache[url] = this;
            // look at the size of the first image
            if (url === aUrl[0]) {
                canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
                canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
            }
            // if (Object.keys(imgCache).length == aUrl.length) {
            if (cnt < 1) {
                if (inFillcolor) {
                    ctx.fillStyle = inFillcolor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                // draw in the proper sequence FIFO
                aUrl.forEach(e => {
                    if (!imgCache[e]) {
                        console.warn(imgCache[e], imgCache);
                    }

                    if (imgCache[e]) {
                        ctx.drawImage(imgCache[e], 0, 0);
                        ctx.save();
                    }
                });

                callback(canvas.toDataURL('image/png'));
                // or to get raw image data
                // callback && callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
            }
        };

        imgCount--;
        image.src = url;
    }
};

Utils.getData = function (url) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        // Make sure to call .open asynchronously
        req.open('GET', url, true);

        req.onload = function () {
            // This is called even on 404 etc
            // so check the status
            if (req.status === 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function () {
            reject(Error('Network Error'));
        };

        // Make the request
        req.send();
    });
};

Utils.negArray = function (arr) {
    /** http://h3manth.com/new/blog/2013/negative-array-index-in-javascript/ */
    return Proxy.create({
        set: function (proxy, index, value) {
            index = parseInt(index);
            return index < 0 ? (arr[arr.length + index] = value) : (arr[index] = value);
        },
        get: function (proxy, index) {
            index = parseInt(index);
            return index < 0 ? arr[arr.length + index] : arr[index];
        }
    });
};

Utils.onChange = function (object, callback) {
    /** https://github.com/sindresorhus/on-change */
    'use strict';
    const handler = {
        get (target, property, receiver) {
            try {
                if (debugEn) console.log('get via Proxy: ', property, target, receiver);
                return new Proxy(target[property], handler);
            } catch (err) {
                if (debugEn) console.log('get via Reflect: ', err, property, target, receiver);
                return Reflect.get(target, property, receiver);
            }
        },
        set (target, property, value, receiver) {
            if (debugEn) console.log('Utils.onChange:set1:', target, property, value, receiver);
            // target[property] = value;
            const b = Reflect.set(target, property, value);
            if (debugEn) console.log('Utils.onChange:set2:', target, property, value, receiver);
            return b;
        },
        defineProperty (target, property, descriptor) {
            if (debugEn) console.log('Utils.onChange:defineProperty:', target, property, descriptor);
            callback(target, property, descriptor);
            return Reflect.defineProperty(target, property, descriptor);
        },
        deleteProperty (target, property) {
            if (debugEn) console.log('Utils.onChange:deleteProperty:', target, property);
            callback(target, property);
            return Reflect.deleteProperty(target, property);
        }
    };

    return new Proxy(object, handler);
};

Utils.observeArray = function (object, callback) {
    'use strict';
    const array = [];
    const handler = {
        get (target, property, receiver) {
            try {
                return new Proxy(target[property], handler);
            } catch (err) {
                return Reflect.get(target, property, receiver);
            }
        },
        set (target, property, value, receiver) {
            if (debugEn) console.log('XXXUtils.observeArray:set1:', target, property, value, array);
            target[property] = value;
            if (debugEn) console.log('XXXUtils.observeArray:set2:', target, property, value, array);
        },
        defineProperty (target, property, descriptor) {
            callback(target, property, descriptor);
            return Reflect.defineProperty(target, property, descriptor);
        },
        deleteProperty (target, property) {
            callback(target, property, descriptor);
            return Reflect.deleteProperty(target, property);
        }
    };

    return new Proxy(object, handler);
};

window['_'] = Utils;

/*
 * connectElgatoStreamDeckSocket
 * This is the first function StreamDeck Software calls, when
 * establishing the connection to the plugin or the Property Inspector
 * @param {string} inPort - The socket's port to communicate with StreamDeck software.
 * @param {string} inUUID - A unique identifier, which StreamDeck uses to communicate with the plugin
 * @param {string} inMessageType - Identifies, if the event is meant for the property inspector or the plugin.
 * @param {string} inApplicationInfo - Information about the host (StreamDeck) application
 * @param {string} inActionInfo - Context is an internal identifier used to communicate to the host application.
 */


// eslint-disable-next-line no-unused-vars
function connectElgatoStreamDeckSocket (
    inPort,
    inUUID,
    inMessageType,
    inApplicationInfo,
    inActionInfo
) {
    StreamDeck.getInstance().connect(arguments);
    window.$SD.api = Object.assign({ send: SDApi.send }, SDApi.common, SDApi[inMessageType]);
}

/* legacy support */

function connectSocket (
    inPort,
    inUUID,
    inMessageType,
    inApplicationInfo,
    inActionInfo
) {
    connectElgatoStreamDeckSocket(
        inPort,
        inUUID,
        inMessageType,
        inApplicationInfo,
        inActionInfo
    );
}

/**
 * StreamDeck object containing all required code to establish
 * communication with SD-Software and the Property Inspector
 */

const StreamDeck = (function () {
    // Hello it's me
    var instance;
    /*
      Populate and initialize internally used properties
    */

    function init () {
        // *** PRIVATE ***

        var inPort,
            inUUID,
            inMessageType,
            inApplicationInfo,
            inActionInfo,
            websocket = null;

        var events = ELGEvents.eventEmitter();
        var logger = SDDebug.logger();

        function showVars () {
            debugLog('---- showVars');
            debugLog('- port', inPort);
            debugLog('- uuid', inUUID);
            debugLog('- messagetype', inMessageType);
            debugLog('- info', inApplicationInfo);
            debugLog('- inActionInfo', inActionInfo);
            debugLog('----< showVars');
        }

        function connect (args) {
            inPort = args[0];
            inUUID = args[1];
            inMessageType = args[2];
            inApplicationInfo = Utils.parseJson(args[3]);
            inActionInfo = args[4] !== 'undefined' ? Utils.parseJson(args[4]) : args[4];

            /** Debug variables */
            if (debug) {
                showVars();
            }

            const lang = Utils.getProp(inApplicationInfo,'application.language', false);
            if (lang) {
                loadLocalization(lang, inMessageType === 'registerPropertyInspector' ? '../' : './', function() {
                    events.emit('localizationLoaded', {language:lang});
                });
            };

            /** restrict the API to what's possible
             * within Plugin or Property Inspector
             * <unused for now>
             */
            // $SD.api = SDApi[inMessageType];

            if (websocket) {
                websocket.close();
                websocket = null;
            };

            websocket = new WebSocket('ws://127.0.0.1:' + inPort);

            websocket.onopen = function () {
                var json = {
                    event: inMessageType,
                    uuid: inUUID
                };

                // console.log('***************', inMessageType + "  websocket:onopen", inUUID, json);

                websocket.sendJSON(json);
                $SD.uuid = inUUID;
                $SD.actionInfo = inActionInfo;
                $SD.applicationInfo = inApplicationInfo;
                $SD.messageType = inMessageType;
                $SD.connection = websocket;

                instance.emit('connected', {
                    connection: websocket,
                    port: inPort,
                    uuid: inUUID,
                    actionInfo: inActionInfo,
                    applicationInfo: inApplicationInfo,
                    messageType: inMessageType
                });
            };

            websocket.onerror = function (evt) {
                console.warn('WEBOCKET ERROR', evt, evt.data);
            };

            websocket.onclose = function (evt) {
                // Websocket is closed
                var reason = WEBSOCKETERROR(evt);
                console.warn(
                    '[STREAMDECK]***** WEBOCKET CLOSED **** reason:',
                    reason
                );
                instance.emit('disconnected', {
                    connection: websocket,
                    port: inPort,
                    uuid: inUUID,
                    actionInfo: inActionInfo,
                    applicationInfo: inApplicationInfo,
                    messageType: inMessageType
                });
            };

            websocket.onmessage = function (evt) {
                var jsonObj = Utils.parseJson(evt.data),
                    m;

                if (debugEn) console.log('[STREAMDECK] websocket.onmessage ... ', jsonObj.event, jsonObj);

                if (!jsonObj.hasOwnProperty('action')) {
                    m = jsonObj.event;
                    if (debugEn) console.log('%c%s', 'color: white; background: red; font-size: 12px;', '[common.js]onmessage:', m);
                } else {
                    switch (inMessageType) {
                    case 'registerPlugin':
                        m = jsonObj['action'] + '.' + jsonObj['event'];
                        break;
                    case 'registerPropertyInspector':
                        m = 'sendToPropertyInspector';
                        break;
                    default:
                        if (debugEn) console.log('%c%s', 'color: white; background: red; font-size: 12px;', '[STREAMDECK] websocket.onmessage +++++++++  PROBLEM ++++++++');
                        console.warn('UNREGISTERED MESSAGETYPE:', inMessageType);
                    }
                }

                if (m && m !== '') 
                    events.emit(m, jsonObj);
            };

            instance.connection = websocket;
        }

        return {
            // *** PUBLIC ***

            uuid: inUUID,
            on: events.on,
            emit: events.emit,
            connection: websocket,
            connect: connect,
            api: null,
            logger: logger
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();



// eslint-disable-next-line no-unused-vars
function initializeControlCenterClient () {
    const settings = Object.assign(REMOTESETTINGS || {}, { debug: false });
    var $CC = new ControlCenterClient(settings);
    window['$CC'] = $CC;
    return $CC;
}

/** ELGEvents
 * Publish/Subscribe pattern to quickly signal events to
 * the plugin, property inspector and data.
 */

const ELGEvents = {
    eventEmitter: function (name, fn) {
        const eventList = new Map();
        
        const on = (name, fn) => {
            if (!eventList.has(name)) eventList.set(name, ELGEvents.pubSub());

            return eventList.get(name).sub(fn);
        };

        const has = (name) =>
            eventList.has(name);

        const emit = (name, data) =>
            eventList.has(name) && eventList.get(name).pub(data);
        
        return Object.freeze({ on, has, emit, eventList });
    },

    pubSub: function pubSub () {
        const subscribers = new Set();

        const sub = fn => {
            subscribers.add(fn);
            return () => {
                subscribers.delete(fn);
            };
        };

        const pub = data => subscribers.forEach(fn => fn(data));
        return Object.freeze({ pub, sub });
    }
};

/** SDApi
 * This ist the main API to communicate between plugin, property inspector and
 * application host.
 * Internal functions:
 * - setContext: sets the context of the current plugin
 * - exec: prepare the correct JSON structure and send
 *
 * Methods exposed in the $SD.api alias
 * Messages send from the plugin
 * -----------------------------
 * - showAlert
 * - showOK
 * - setSettings
 * - setTitle
 * - setImage
 * - sendToPropertyInspector
 *
 * Messages send from Property Inspector
 * -------------------------------------
 * - sendToPlugin
 *
 * Messages received in the plugin
 * -------------------------------
 * willAppear
 * willDisappear
 * keyDown
 * keyUp
 */

const SDApi = {
    send: function (context, fn, payload, debug) {
        if (debugEn) console.log("send")
        /** Combine the passed JSON with the name of the event and it's context
         * If the payload contains 'event' or 'context' keys, it will overwrite existing 'event' or 'context'.
         * This function is non-mutating and thereby creates a new object containing
         * all keys of the original JSON objects.
         */
        const pl = Object.assign({}, { event: fn, context: context }, payload);

        /** Check, if we have a connection, and if, send the JSON payload */
        if (debug) {
            if (debugEn) console.log('-----SDApi.send-----');
            if (debugEn) console.log('context', context);
            if (debugEn) console.log(pl);
            if (debugEn) console.log(payload.payload);
            if (debugEn) console.log(JSON.stringify(payload.payload));
            if (debugEn) console.log('-------');
        }
        $SD.connection && $SD.connection.sendJSON(pl);

        /**
         * DEBUG-Utility to quickly show the current payload in the Property Inspector.
         */

        if (
            $SD.connection &&
            [
                'sendToPropertyInspector',
                'showOK',
                'showAlert',
                'setSettings'
            ].indexOf(fn) === -1
        ) {
             if (debugEn) console.log("send.sendToPropertyInspector", payload);
            // this.sendToPropertyInspector(context, typeof payload.payload==='object' ? JSON.stringify(payload.payload) : JSON.stringify({'payload':payload.payload}), pl['action']);
        }
    },

    registerPlugin: {

        /** Messages send from the plugin */
        showAlert: function (context) {
            SDApi.send(context, 'showAlert', {});
        },

        showOk: function (context) {
            SDApi.send(context, 'showOk', {});
        },


        setState: function (context, payload) {
            SDApi.send(context, 'setState', {
                payload: {
                    'state': 1 - Number(payload === 0)
                }
            });
        },

        setTitle: function (context, title, target) {
            if (debugEn) console.log('setTitle')
            SDApi.send(context, 'setTitle', {
                payload: {
                    title: '' + title || '',
                    target: target || DestinationEnum.HARDWARE_AND_SOFTWARE
                }
            });
        },

        setImage: function (context, img, target) {
            SDApi.send(context, 'setImage', {
                payload: {
                    image: img || '',
                    target: target || DestinationEnum.HARDWARE_AND_SOFTWARE
                }
            });
        },

        sendToPropertyInspector: function (context, payload, action) {
            SDApi.send(context, 'sendToPropertyInspector', {
                action: action,
                payload: payload
            });
        },

        showUrl2: function (context, urlToOpen) {
            SDApi.send(context, 'openUrl', {
                payload: {
                    url: urlToOpen
                }
            });
        }
    },

    /** Messages send from Property Inspector */

    registerPropertyInspector: {

        sendToPlugin: function (piUUID, action, payload) {
            SDApi.send(
                piUUID,
                'sendToPlugin',
                {
                    action: action,
                    payload: payload || {}
                },
                false
            );
        }
    },

    /** COMMON */

    common: {
        getSettings: function (context, payload) {
            SDApi.send(context, 'getSettings', {});
        },

        setSettings: function (context, payload) {
            SDApi.send(context, 'setSettings', {
                payload: payload
            });
        },

        getGlobalSettings: function (context, payload) {
            SDApi.send(context, 'getGlobalSettings', {});
        },

        setGlobalSettings: function (context, payload) {
            SDApi.send(context, 'setGlobalSettings', {
                payload: payload
            });
        },

        logMessage: function () {
           /**
            * for logMessage we don't need a context, so we allow both
            * logMessage(unneededContext, 'message')
            * and
            * logMessage('message')
            */

            let payload = (arguments.length > 1) ? arguments[1] : arguments[0];

            SDApi.send(null, 'logMessage', {
                payload: {
                    message: payload
                }
            });
        },

        openUrl: function (context, urlToOpen) {
            SDApi.send(context, 'openUrl', {
                payload: {
                    url: urlToOpen
                }
            });
        },

        test: function () {
            if (debugEn) console.log(this);
            if (debugEn) console.log(SDApi);
        },

        debugPrint: function (context, inString) {
            // console.log("------------ DEBUGPRINT");
            // console.log([].slice.apply(arguments).join());
            // console.log("------------ DEBUGPRINT");
            SDApi.send(context, 'debugPrint', {
                payload: [].slice.apply(arguments).join('.') || ''
            });
        },

        dbgSend: function (fn, context) {
            /** lookup if an appropriate function exists */
            if ($SD.connection && this[fn] && typeof this[fn] === 'function') {
                /** verify if type of payload is an object/json */
                const payload = this[fn]();
                if (typeof payload === 'object') {
                    Object.assign({ event: fn, context: context }, payload);
                    $SD.connection && $SD.connection.sendJSON(payload);
                }
            }
            if (debugEn) console.log(this, fn, typeof this[fn], this[fn]());
        }

    }
};

/** SDDebug
 * Utility to log the JSON structure of an incoming object
 */

const SDDebug = {
    logger: function (name, fn) {
        const logEvent = jsn => {
            if (debugEn) console.log('____SDDebug.logger.logEvent');
            if (debugEn) console.log(jsn);
            debugLog('-->> Received Obj:', jsn);
            debugLog('jsonObj', jsn);
            debugLog('event', jsn['event']);
            debugLog('actionType', jsn['actionType']);
            debugLog('settings', jsn['settings']);
            debugLog('coordinates', jsn['coordinates']);
            debugLog('---');
        };

        const logSomething = jsn =>
            console.log('____SDDebug.logger.logSomething');

        return { logEvent, logSomething };
    }
};

/**
 * This is the instance of the StreamDeck object.
 * There's only one StreamDeck object, which carries
 * connection parameters and handles communication
 * to/from the software's PluginManager.
 */

window.$SD = StreamDeck.getInstance();
window.$SD.api = SDApi;

function WEBSOCKETERROR (evt) {
    // Websocket is closed
    var reason = '';
    if (evt.code === 1000) {
        reason = 'Normal Closure. The purpose for which the connection was established has been fulfilled.';
    } else if (evt.code === 1001) {
        reason = 'Going Away. An endpoint is "going away", such as a server going down or a browser having navigated away from a page.';
    } else if (evt.code === 1002) {
        reason = 'Protocol error. An endpoint is terminating the connection due to a protocol error';
    } else if (evt.code === 1003) {
        reason = "Unsupported Data. An endpoint received a type of data it doesn't support.";
    } else if (evt.code === 1004) {
        reason = '--Reserved--. The specific meaning might be defined in the future.';
    } else if (evt.code === 1005) {
        reason = 'No Status. No status code was actually present.';
    } else if (evt.code === 1006) {
        reason = 'Abnormal Closure. The connection was closed abnormally, e.g., without sending or receiving a Close control frame';
    } else if (evt.code === 1007) {
        reason = 'Invalid frame payload data. The connection was closed, because the received data was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629]).';
    } else if (evt.code === 1008) {
        reason = 'Policy Violation. The connection was closed, because current message data "violates its policy". This reason is given either if there is no other suitable reason, or if there is a need to hide specific details about the policy.';
    } else if (evt.code === 1009) {
        reason = 'Message Too Big. Connection closed because the message is too big for it to process.';
    } else if (evt.code === 1010) { // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
        reason = "Mandatory Ext. Connection is terminated the connection because the server didn't negotiate one or more extensions in the WebSocket handshake. <br /> Mandatory extensions were: " + evt.reason;
    } else if (evt.code === 1011) {
        reason = 'Internl Server Error. Connection closed because it encountered an unexpected condition that prevented it from fulfilling the request.';
    } else if (evt.code === 1015) {
        reason = "TLS Handshake. The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
    } else {
        reason = 'Unknown reason';
    }

    return reason;
}

const SOCKETERRORS = {
    '0': 'The connection has not yet been established',
    '1': 'The connection is established and communication is possible',
    '2': 'The connection is going through the closing handshake',
    '3': 'The connection has been closed or could not be opened'
};



function setElements(id) {
    let selection;
    let options = [1,2];

    if (id == 'stats') {
        options = getStats(system);
        selection = settings.stats ? settings.stats : 'none';
    }
    else if (id == 'ability' || id == 'rollAbility') {
        options = getAbilities(system);
        selection = settings.ability ? settings.ability : 'str';
    }
    else if (id == 'onClick') {
        options = getOnClick(system);
        selection = settings.onClick ? settings.onClick : 'doNothing';
    }
    else if (id == 'condition') {
        options = getConditions(system);
        selection = settings.condition ? settings.condition : 'removeAll';
    }
    else if (id == 'skill' || id == 'rollSkill') {
        options = getSkills(system);
        selection = settings.rollSkill;
        if (selection == undefined) {
            if (system == 'dnd5e' || system == 'pf2e') selection = 'acr';
            else if (system == 'D35E' || system == 'pf1') selection = 'apr'
        }
    }
    else if (id == 'roll') {
        options = getRolls(system);
        selection = settings.roll ? settings.roll : 'ability';
    }
    else if (id == 'save' || id == 'rollSave') {
        options = getSaves(system);
        selection = settings.save;
        if (selection == undefined) {
            if (system == 'dnd5e') selection = 'str';
            else selection == 'fort';
        }
    }
    else if (id == 'inventoryType') {
        options = getItemTypes(system)
        selection = settings.inventoryType;
        if (selection == undefined) selection = 'any';
    }
    else if (id == 'featureType') {
        options = getFeatureTypes(system)
        selection = settings.featureType;
        if (selection == undefined) selection = 'any';
    }
    else if (id == 'spellType') {
        options = getSpellTypes(system)
        selection = settings.spellType;
        if (selection == undefined) selection = 'any';
    }

    let element = document.getElementById(id);
    for (let option of options) {
        let newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.innerHTML = option.name;
        element.appendChild(newOption);
    }
    element.value = selection;
    //console.log('element',id,options,element)
}

function getStats(system){
    let stats = [];
    if (system == 'D35E' || system == 'pf1') 
        stats = [
            {value:'HP', name:'HP'},
            {value:'HPbox', name:'HP (box)'},
            {value:'TempHP', name:'Temp HP'},
            {value:'AC', name:'AC'},
            {value:'Speed', name:'Speed'},
            {value:'Init', name:'Initiative'},
            {value:'Ability', name:'Ability Score'},
            {value:'AbilityMod', name:'Ability Score Modifier'},
            {value:'Save', name:'Saving Throw Modifier'},
            {value:'Skill', name:'Skill Modifier'},
            {value:'Prof', name:'Proficiency'}
        ]
    else if (system == 'pf2e')
        stats = [
            {value:'HP', name:'HP'},
            {value:'HPbox', name:'HP (box)'},
            {value:'TempHP', name:'Temp HP'},
            {value:'AC', name:'AC'},
            {value:'ShieldHP', name:'Shield HP'},
            {value:'Speed', name:'Speed'},
            {value:'Init', name:'Initiative'},
            {value:'Ability', name:'Ability Score'},
            {value:'AbilityMod', name:'Ability Score Modifier'},
            {value:'Save', name:'Saving Throw Modifier'},
            {value:'Skill', name:'Skill Modifier'},
            {value:'Prof', name:'Proficiency'},
            {value:'Condition', name: 'Condition'},
            {value:'Perception', name: 'Perception'}
        ]
    else if (system == 'demonlord')
        stats = [
            {value:'HP', name:'HP'},
            {value:'HPbox', name:'HP (box)'},
            {value:'AC', name:'AC'},
            {value:'Speed', name:'Speed'},
            {value:'Init', name:'Initiative'},
            {value:'Ability', name:'Ability Score'},
            {value:'AbilityMod', name:'Ability Score Modifier'}
        ]
    else if (system == 'forbidden-lands')
        stats = [
            {value:'HP', name:'Strength'},
            {value:'HPbox', name:'Strength (box)'},
            {value:'Agility', name:'Agility'},
            {value:'Wits', name:'Wits'},
            {value:'Empathy', name:'Empathy'},
            {value:'WillPower', name:'Will Power'},
            {value:'AC', name:'Armor'},
            {value:'Skill', name:'Skill'}
        ]
    else if (system == "wfrp4e")
        stats = [
            {value: 'Advantage', name: 'Advantage'},
            {value: 'Corruption', name: 'Corruption'},
            {value: 'CriticalWounds', name: 'Critical Wounds'},
            {value: 'Encumbrance', name: 'Encumbrance'},
            {value: 'Fate', name: 'Fate'},
            {value: 'Fortune', name: 'Fortune'},
            {value: 'Wounds', name: 'Wounds'},
            {value: 'Movement', name: 'Movement'},
            {value: 'Resilience', name: 'Resilience'},
            {value: 'Resolve', name: 'Resolve'},
            {value: 'Ability', name: 'Characteristics' } /* value is ability to conform to the interface */    
        ]
    else if (system == "sfrpg")
        stats = [
            {value:'HP', name:'HP'},
            {value:'HPbox', name:'HP (box)'},
            {value:'Stamina', name:'Stamina'},
            {value:'AC', name:'Energy AC'},
            {value:'KinAC', name:'Kinetic AC'},
            {value:'Speed', name:'Speed'},
            {value:'Init', name:'Initiative'},
            {value:'Ability', name:'Ability Score'},
            {value:'AbilityMod', name:'Ability Score Modifier'},
            {value:'Save', name:'Saving Throw Modifier'},
            {value:'Skill', name:'Skill Modifier'}
        ]
    else 
        stats = [
            {value:'HP', name:'HP'},
            {value:'HPbox', name:'HP (box)'},
            {value:'TempHP', name:'Temp HP'},
            {value:'AC', name:'AC'},
            {value:'Speed', name:'Speed'},
            {value:'Init', name:'Initiative'},
            {value:'Ability', name:'Ability Score'},
            {value:'AbilityMod', name:'Ability Score Modifier'},
            {value:'Save', name:'Saving Throw Modifier'},
            {value:'Skill', name:'Skill Modifier'},
            {value:'PassivePerception', name:'Passive Perception'},
            {value:'PassiveInvestigation', name:'Passive Investigation'},
            {value:'Prof', name:'Proficiency'}
        ]
    return stats;
}

function getAbilities(system){
    let abilities = [];
    if (system == 'demonlord')
        abilities = [
            {value:'strength',name:'Strength'},
            {value:'agility',name:'Agility'},
            {value:'intellect',name:'Intellect'},
            {value:'will',name:'Will'},
            {value:'perception',name:'Perception'}
        ]
    else if (system == 'wfrp4e') /* bit of a bastardization here ... */
        abilities = [
            {value: 'ag', name: 'Agility'},
            {value: 'bs', name: 'Ballistic Skill'},
            {value: 'dex', name: 'Dexterity'},
            {value: 'fel', name: 'Fellowship'},
            {value: 'i', name: 'Initiative'},
            {value: 'int', name: 'Intelligence'},
            {value: 's', name: 'Strength'},
            {value: 't', name: 'Toughness'},
            {value: 'wp', name: 'Willpower'},
            {value: 'ws', name: 'Weapon Skill'}
        ]
    else if (system == 'forbidden-lands') 
        abilities = [
            {value: 'strength', name: 'Strength'},
            {value: 'agility', name: 'Agility'},
            {value: 'wits', name: 'Wits'},
            {value: 'empathy', name: 'Empathy'}
        ]   
    else
        abilities = [
            {value:'str',name:'Strength'},
            {value:'dex',name:'Dexterity'},
            {value:'con',name:'Constitution'},
            {value:'int',name:'Intelligence'},
            {value:'wis',name:'Wisdom'},
            {value:'cha',name:'Charisma'}
        ]
    return abilities;
}

function getSaves(system){
    let saves = [];
    if (system == 'D35E' || system == 'pf1' || system == 'pf2e' || system == 'sfrpg')
        saves = [
            {value:'fort',name:'Fortitude'},
            {value:'ref',name:'Reflex'},
            {value:'will',name:'Will'},
        ]
    else if (system == 'wfrp4e')
        ; //pass
    else if (system == 'dnd5e')
        saves = getAbilities(system);
    else if (system == 'forbidden-lands')
        saves = getAbilities(system);
    return saves;
}

function getOnClick(system){
    let onClick = [];
    if (system == 'demonlord')
        onClick = [
            {value:'initiative',name:'Toggle Initiative'}
        ];
    return onClick;
}

function getConditions(system){
    let conditions = [];
    if (system == 'D35E') 
        conditions = [
            {value:'dead', name:'Dead'},
            {value:'blind', name:'Blind'},
            {value:'dazzled', name:'Dazzled'},
            {value:'deaf', name:'Deaf'},
            {value:'entangled', name:'Entangled'},
            {value:'fatigued', name:'Fatigued'},
            {value:'exhausted', name:'Exhausted'},
            {value:'grappled', name:'Grappled'},
            {value:'helpless', name:'Helpless'},
            {value:'paralyzed', name:'Paralyzed'},
            {value:'pinned', name:'Pinned'},
            {value:'fear', name:'Fear'},
            {value:'sickened', name:'Sickened'},
            {value:'stunned', name:'Stunned'},
            {value:'shaken', name:'Shaken'}
        ]
    else if (system == 'pf1') 
        conditions = [
            {value:'dead', name:'Dead'},
            {value:'bleed', name:'Bleed'},
            {value:'blind', name:'Blind'},
            {value:'confused', name:'Confused'},
            {value:'dazzled', name:'Dazzled'},
            {value:'deaf', name:'Deaf'},
            {value:'entangled', name:'Entangled'},
            {value:'fatigued', name:'Fatigued'},
            {value:'exhausted', name:'Exhausted'},
            {value:'grappled', name:'Grappled'},
            {value:'helpless', name:'Helpless'},
            {value:'incorporeal', name:'Incorporeal'},
            {value:'invisible', name:'Invisible'},
            {value:'paralyzed', name:'Paralyzed'},
            {value:'pinned', name:'Pinned'},
            {value:'prone', name:'Prone'},
            {value:'staggered', name:'Staggered'},
            {value:'stunned', name:'Stunned'},
            {value:'shaken', name:'Shaken'},
            {value:'frightened', name:'Frightened'},
            {value:'panicked', name:'Panicked'},
            {value:'sickened', name:'Sickened'},
            {value:'nauseated', name:'Nauseated'},
            {value:'dazed', name:'Dazed'}
        ]
    else if (system == 'pf2e') 
        conditions = [
            {value:'blinded', name:'Blinded'},
            {value:'broken', name:'Broken'},
            {value:'clumsy', name:'Clumsy'},
            {value:'concealed', name:'Concealed'},
            {value:'confused', name:'Confused'},
            {value:'controlled', name:'Controlled'},
            {value:'dazzled', name:'Dazzled'},
            {value:'deafened', name:'Deafened'},
            {value:'doomed', name:'Doomed'},
            {value:'drained', name:'Drained'},
            {value:'dying', name:'Dying'},
            {value:'encumbered', name:'Encumbered'},
            {value:'enfeebled', name:'Enfeebled'},
            {value:'fascinated', name:'Fascinated'},
            {value:'fatigued', name:'Fatigued'},
            {value:'flatFooted', name:'Flat Footed'},
            {value:'fleeing', name:'Fleeing'},
            {value:'frightened', name:'Frightened'},
            {value:'grabbed', name:'Grabbed'},
            {value:'immobilized', name:'Immobilized'},
            {value:'invisible', name:'Invisible'},
            {value:'paralyzed', name:'Paralyzed'},
            {value:'persistentDamage', name:'Persistent Damage'},
            {value:'petrified', name:'Petrified'},
            {value:'prone', name:'Prone'},
            {value:'quickened', name:'Quickened'},
            {value:'restrained', name:'Restrained'},
            {value:'sickened', name:'Sickened'},
            {value:'slowed', name:'Slowed'},
            {value:'stunned', name:'Stunned'},
            {value:'stupefied', name:'Stupefied'},
            {value:'unconscious', name:'Unconscious'},
            {value:'wounded', name:'Wounded'}
        ]
    else if (system == 'demonlord') 
        conditions = [
            {value:'asleep', name:'Asleep'},
            {value:'blinded', name:'Blinded'},
            {value:'charmed', name:'Charmed'},
            {value:'compelled', name:'Compelled'},
            {value:'dazed', name:'Dazed'},
            {value:'deafened', name:'Deafened'},
            {value:'defenseless', name:'Defenseless'},
            {value:'diseased', name:'Diseased'},
            {value:'fatigued', name:'Fatigued'},
            {value:'frightened', name:'Frightened'},
            {value:'horrified', name:'Horrified'},
            {value:'grabbed', name:'Grabbed'},
            {value:'immobilized', name:'Immobilized'},
            {value:'impaired', name:'Impaired'},
            {value:'poisoned', name:'Poisoned'},
            {value:'prone', name:'Prone'},
            {value:'slowed', name:'Slowed'},
            {value:'stunned', name:'Stunned'},
            {value:'surprised', name:'Surprised'},
            {value:'unconscious', name:'Unconscious'},
            {value:'injured', name:'Injured'}
        ]
    else if (system == 'wfrp4e') 
        conditions = [
            {value:'ablaze', name:'Ablaze'},
            {value:'bleeding', name:'Bleeding'},
            {value:'blinded', name:'Blinded'},
            {value:'broken', name:'Broken'},
            {value:'deafened', name:'Deafened'},
            {value:'entangled', name:'Entangled'},
            {value:'fatigued', name:'fatigued'},
            {value:'poison', name:'Poison'},
            {value:'prone', name:'Prone'},
            {value:'stunned', name:'Stunned'},
            {value:'surprised', name:'Surprised'},
            {value:'unconscious', name:'Unconscious'}
        ]
    else if (system == 'wfrp4e') 
        conditions = [
            {value:'sleepy', name:'sleepy'},
            {value:'thirsty', name:'thirsty'},
            {value:'hungry', name:'hungry'},
            {value:'cold', name:'cold'}
        ]
    else if (system == 'sfrpg')  //{value:'',name: ''},
        conditions = [
            {value:'asleep', name:'Asleep'},
            {value:'bleeding', name:'Bleeding'},
            {value:'blinded', name:'Blinded'},
            {value:'broken', name:'Broken'},
            {value:'burning', name:'Burning'},
            {value:'confused', name:'Confused'},
            {value:'cowering',name: 'Cowering'},
            {value:'dazed',name: 'Dazed'},
            {value:'dazzled', name:'Dazzled'},
            {value:'dead',name: 'Dead'},
            {value:'deafened', name:'Deafened'},
            {value:'dying',name: 'Dying'},
            {value:'encumbered',name: 'Encumbered'},
            {value:'entangled', name:'Entangled'},
            {value:'exhausted', name:'Exhausted'},
            {value:'fascinated', name:'Fascinated'},
            {value:'fatigued', name:'Fatigued'},
            {value:'flat-footed',name: 'Flat-footed'},
            {value:'frightened',name: 'Frightened'},
            {value:'grappled', name:'Grappled'},
            {value:'helpless', name:'Helpless'},
            {value:'nauseated', name:'Nauseated'},
            {value:'off-kilter',name: 'Off-kilter'},
            {value:'off-target',name: 'Off-target'},
            {value:'overburdened',name: 'Overburduned'},
            {value:'panicked',name: 'Panicked'},
            {value:'paralyzed', name:'Paralyzed'},
            {value:'pinned', name:'Pinned'},
            {value:'prone', name:'Prone'},
            {value:'shaken', name:'Shaken'},
            {value:'sickened', name:'Sickened'},
            {value:'stable',name: 'Stable'},
            {value:'staggered',name: 'Staggered'},
            {value:'stunned',name: 'Stunned'},
            {value:'unconscious',name: 'Unconscious'}
        ]
    else  //default/dnd5e
        conditions = [
            {value:'dead', name:'Dead'},
            {value:'unconscious', name:'Unconscious'},
            {value:'sleep', name:'Asleep'},
            {value:'stun', name:'Stunned'},
            {value:'prone', name:'Prone'},
            {value:'restrain', name:'Restrained'},
            {value:'paralysis', name:'Paralyzed'},
            {value:'fly', name:'Flying'},
            {value:'blind', name:'Blind'},
            {value:'deaf', name:'Deaf'},
            {value:'silence', name:'Silenced'},
            {value:'fear', name:'Afraid'},
            {value:'burning', name:'Burning'},
            {value:'frozen', name:'Frozen'},
            {value:'shock', name:'Shocked'},
            {value:'corrode', name:'Corroding'},
            {value:'bleeding', name:'Bleeding'},
            {value:'disease', name:'Diseased'},
            {value:'poison', name:'Poisoned'},
            {value:'radiation', name:'Radioactive'},
            {value:'regen', name:'Regeneration'},
            {value:'degen', name:'Degeneration'},
            {value:'upgrade', name:'Empowered'},
            {value:'downgrade', name:'Weakened'},
            {value:'target', name:'Targeted'},
            {value:'eye', name:'Marked'},
            {value:'curse', name:'Cursed'},
            {value:'bless', name:'Blessed'},
            {value:'fireShield', name:'Fire Shield'},
            {value:'coldShield', name:'Ice Shield'},
            {value:'magicShield', name:'Magic Shield'},
            {value:'holyShield', name:'Holy Shield'}
        ]  
    return conditions;
}

function getSkills(system){
    let skills = [];
    if (system == 'D35E') 
        skills = [
            {value:'apr', name:'Appraise'},
            {value:'aut', name:'Autohypnosis'},
            {value:'blc', name:'Balance'},
            {value:'blf', name:'Bluff'},
            {value:'clm', name:'Climb'},
            {value:'coc', name:'Concentration'},
            {value:'crf', name:'Craft'},
            {value:'dsc', name:'Decipher Script'},
            {value:'dip', name:'Diplomacy'},
            {value:'dev', name:'Disable Device'},
            {value:'dis', name:'Disguise'},
            {value:'esc', name:'Escape Artist'},
            {value:'fog', name:'Forgery'},
            {value:'gif', name:'Gather Information'},
            {value:'han', name:'Handle Animal'},
            {value:'hea', name:'Heal'},
            {value:'hid', name:'Hide'},
            {value:'int', name:'Intimidate'},
            {value:'jmp', name:'Jump'},
            {value:'kar', name:'Knowledge (Arcana)'},
            {value:'kdu', name:'Knowledge (Dungeoneering)'},
            {value:'ken', name:'Knowledge (Engineering)'},
            {value:'kge', name:'Knowledge (Geography)'},
            {value:'khi', name:'Knowledge (History)'},
            {value:'klo', name:'Knowledge (Local)'},
            {value:'kna', name:'Knowledge (Nature)'},
            {value:'kno', name:'Knowledge (Nobility)'},
            {value:'kpl', name:'Knowledge (Planes)'},
            {value:'kps', name:'Knowledge (Psionics)'},
            {value:'kre', name:'Knowledge (Religion)'},
            {value:'lis', name:'Listen'},
            {value:'mos', name:'Move Silently'},
            {value:'opl', name:'Open Lock'},
            {value:'prf', name:'Perform'},
            {value:'pro', name:'Profession'},
            {value:'psi', name:'Psicraft'},
            {value:'rid', name:'Ride'},
            {value:'src', name:'Search'},
            {value:'sen', name:'Sense Motive'},
            {value:'slt', name:'Slight of Hand'},
            {value:'spl', name:'Spellcraft'},
            {value:'spt', name:'Spot'},
            {value:'sur', name:'Survival'},
            {value:'swm', name:'Swim'},
            {value:'tmb', name:'Tumble'},
            {value:'umd', name:'Use Magic Device'},
            {value:'upd', name:'Use Psionic Device'},
            {value:'uro', name:'Use Rope'}
        ]
    else if (system == 'pf1') 
        skills = [
            {value:'acr', name:'Acrobatics'},
            {value:'apr', name:'Appraise'},
            {value:'art', name:'Artistry'},
            {value:'blf', name:'Bluff'},
            {value:'clm', name:'Climb'},
            {value:'crf', name:'Craft'},
            {value:'dip', name:'Diplomacy'},
            {value:'dev', name:'Disable Device'},
            {value:'dis', name:'Disguise'},
            {value:'esc', name:'Escape Artist'},
            {value:'fly', name:'Fly'},
            {value:'han', name:'Handle Animal'},
            {value:'hea', name:'Heal'},
            {value:'int', name:'Intimidate'},
            {value:'kar', name:'Knowledge (Arcana)'},
            {value:'kdu', name:'Knowledge (Dungeoneering)'},
            {value:'ken', name:'Knowledge (Engineering)'},
            {value:'kge', name:'Knowledge (Geography)'},
            {value:'khi', name:'Knowledge (History)'},
            {value:'klo', name:'Knowledge (Local)'},
            {value:'kna', name:'Knowledge (Nature)'},
            {value:'kno', name:'Knowledge (Nobility)'},
            {value:'kpl', name:'Knowledge (Planes)'},
            {value:'kre', name:'Knowledge (Religion)'},
            {value:'lin', name:'Linguistics'},
            {value:'lor', name:'Lore'},
            {value:'per', name:'Perception'},
            {value:'prf', name:'Perform'},
            {value:'pro', name:'Profession'},
            {value:'rid', name:'Ride'},
            {value:'sen', name:'Sense Motive'},
            {value:'slt', name:'Slight of Hand'},
            {value:'spl', name:'Spellcraft'},
            {value:'ste', name:'Stealth'},
            {value:'sur', name:'Survival'},
            {value:'swm', name:'Swim'},
            {value:'umd', name:'Use Magic Device'}    
        ]
    else if (system == 'pf2e') 
        skills = [
            {value:'acr', name:'Acrobatics'},
            {value:'arc', name:'Arcana'},
            {value:'ath', name:'Athletics'},
            {value:'cra', name:'Crafting'},
            {value:'dec', name:'Deception'},
            {value:'dip', name:'Diplomacy'},
            {value:'inv', name:'Intimidation'},
            {value:'med', name:'Medicine'},
            {value:'nat', name:'Nature'},
            {value:'occ', name:'Occultism'},
            {value:'prf', name:'Performance'},
            {value:'rel', name:'Religion'},
            {value:'soc', name:'Society'},
            {value:'ste', name:'Stealth'},
            {value:'sur', name:'Survival'},
            {value:'thi', name:'Thievery'},
            {value:'lor_1', name:'Lore #1'},
            {value:'lor_2', name:'Lore #2'},
            {value:'lor_3', name:'Lore #3'}
        ]
    else if (system == 'demonlord') {}
    else if (system == 'wfrp4e') {
        skills = [
            {value: 'ag', name: 'Agility'},
            {value: 'bs', name: 'Ballistic Skill'},
            {value: 'dex', name: 'Dexterity'},
            {value: 'fel', name: 'Fellowship'},
            {value: 'i', name: 'Initiative'},
            {value: 'int', name: 'Intelligence'},
            {value: 's', name: 'Strength'},
            {value: 't', name: 'Toughness'},
            {value: 'wp', name: 'Willpower'},
            {value: 'ws', name: 'Weapon Skill'}
        ]
    }
    else if (system == 'forbidden-lands') {
            skills = [
                {value: 'might', name: 'Might'},
                {value: 'endurance', name: 'Endurance'},
                {value: 'melee', name: 'Melee'},
                {value: 'crafting', name: 'Crafting'},
                {value: 'stealth', name: 'Stealth'},
                {value: 'sleight-of-hand', name: 'Sleight Of Hand'},
                {value: 'move', name: 'Move'},
                {value: 'marksmanship', name: 'Marksmanship'},
                {value: 'scouting', name: 'Scouting'},
                {value: 'lore', name: 'Lore'},
                {value: 'survival', name: 'Survival'},
                {value: 'insight', name: 'Insight'},
                {value: 'manipulation', name: 'Manipulation'},
                {value: 'performance', name: 'Performance'},
                {value: 'healing', name: 'Healing'},
                {value: 'animal-handling', name: 'Animal Handling'}
            ]
    }
    else if (system == 'sfrpg') {
        skills = [
            {value: 'acr', name: 'Acrobatics'},
            {value: 'ath', name: 'Athletics'},
            {value: 'blu', name: 'Bluff'},
            {value: 'com', name: 'Computers'},
            {value: 'cul', name: 'Culture'},
            {value: 'dip', name: 'Diplomacy'},
            {value: 'dis', name: 'Disguise'},
            {value: 'eng', name: 'Engineering'},
            {value: 'int', name: 'Intimidate'},
            {value: 'lsc', name: 'Life Science'},
            {value: 'med', name: 'Medicine'},
            {value: 'mys', name: 'Mysticism'},
            {value: 'per', name: 'Perception'},
            {value: 'phs', name: 'Physical Science'},
            {value: 'pil', name: 'Piloting'},
            {value: 'pro', name: 'Profession'},
            {value: 'sen', name: 'Sense Motive'},
            {value: 'sle', name: 'Sleight of Hand'},
            {value: 'ste', name: 'Stealth'},
            {value: 'sur', name: 'Survival'}
        ]
    }
    else  //default/dnd5e
        skills = [
            {value:'acr', name:'Acrobatics'},
            {value:'ani', name:'Animal Handling'},
            {value:'arc', name:'Arcana'},
            {value:'ath', name:'Athletics'},
            {value:'dec', name:'Deception'},
            {value:'his', name:'History'},
            {value:'ins', name:'Insight'},
            {value:'itm', name:'Intimidation'},
            {value:'inv', name:'Investigation'},
            {value:'med', name:'Medicine'},
            {value:'nat', name:'Nature'},
            {value:'prc', name:'Perception'},
            {value:'prf', name:'Performance'},
            {value:'per', name:'Persuasion'},
            {value:'rel', name:'Religion'},
            {value:'slt', name:'Slight of Hand'},
            {value:'ste', name:'Stealth'},
            {value:'sur', name:'Survival'}
        ]  
    return skills;
}

function getRolls(system){
    let rolls = [];
    if (system == 'D35E') 
        rolls = [
            {value:'initiative', name:'Initiative'},
            {value:'grapple', name:'Grapple'},
            {value:'bab', name:'Base Attack Bonus'},
            {value:'melee', name:'Melee'},
            {value:'ranged', name:'Ranged'}
        ]
    else if (system == 'pf1') 
        rolls = [
            {value:'initiative', name:'Initiative'},
            {value:'cmb', name:'Combat Maneuver Bonus'},
            {value:'bab', name:'Base Attack Bonus'},
            {value:'attack', name:'Attack'},
            {value:'defenses', name:'Defenses'}
        ]
    else if (system == 'pf2e')
        rolls = [
            {value:'initiative', name:'Initiative'},
            {value:'perception', name:'Perception'}
        ]
        else if (system == 'forbidden-lands')
        rolls = [
            {value:'rollFood', name:'Roll Food'},
            {value:'rollWater', name:'Roll Water'},
            {value:'rollArrows', name:'Roll Arrows'},
            {value:'rollTorches', name:'Roll Torches'},
            {value:'rollArmor', name:'Roll Armor'},
            {value:'monsterAttack', name:'Roll Monster Attack'}
        ]
    else if (system == 'demonlord')
        rolls = []
    else 
        rolls = [
            {value:'initiative', name:'Initiative'},
            {value:'deathSave', name:'Death Save'}
        ]
    return rolls;
}

function getItemTypes(system){
    let types = [];
    if (system == 'D35E') 
        types = [
            {value:'weapon', name:'Weapons'},
            {value:'equipment', name:'Armor/Equipment'},
            {value:'consumable', name:'Consumables'},
            {value:'gear', name:'Gear'},
            {value:'ammo', name:'Ammunition'},
            {value:'misc', name:'Miscellaneous'},
            {value:'tradeGoods', name:'Trade Goods'},
            {value:'container', name:'Containers'}
        ]
    else if (system == 'pf1') 
        types = [
            {value:'weapon', name:'Weapons'},
            {value:'equipment', name:'Armor/Equipment'},
            {value:'consumable', name:'Consumables'},
            {value:'gear', name:'Gear'},
            {value:'ammo', name:'Ammunition'},
            {value:'misc', name:'Miscellaneous'},
            {value:'tradeGoods', name:'Trade Goods'},
            {value:'container', name:'Containers'}
        ]
    else if (system == 'pf2e')
        types = [
            {value:'weapon', name:'Weapons'},
            {value:'armor', name:'Armor'},
            {value:'equipment', name:'Equipment'},
            {value:'consumable', name:'Consumables'},
            {value:'treasure', name:'Treasure'}
        ]
    else if (system == 'demonlord')
        types = [

        ]
    else if (system == 'wfrp4e')
        types = [
            {value:'weapon', name: "Weapons"},
            {value:'ammunition', name: "Ammunition"},
            {value:'trapping', name: "Trapping"},
            {value:'armour', name: "Armour"},
            {value:'cargo', name: "Cargo"}
        ]
    else if (system == 'forbidden-lands')
        types = [
            {value:'armor', name: "Armour"},
            {value:'gear', name: "Gear"},
            {value:'weapon', name: "Weapons"},
            {value:'rawMaterial', name: "Raw Material"}
        ]
    else if (system == 'sfrpg')
        types = [
            {value:'weapon', name:'Weapons'},
            {value:'shield', name:'Shields'},
            {value:'equipment', name:'Armor'},
            {value:'ammunition', name:'Ammunition'},
            {value:'consumable', name:'Consumables'},
            {value:'goods', name:'Goods'},
            {value:'container', name:'Containers'},
            {value:'technological', name:'Technological, Magical, and Hybrid Items'},
            {value:'enhancers', name:'Equipment Enhancers'},
            {value:'augmentation', name:'Augmentations'}
        ]
    else 
        types = [
            {value:'weapon', name:'Weapons'},
            {value:'equipment', name:'Equipment'},
            {value:'consumable', name:'Consumables'},
            {value:'tool', name:'Tools'},
            {value:'backpack', name:'Containers'},
            {value:'loot', name:'Loot'}
        ]
    return types;
}

function getFeatureTypes(system){
    let types = [];
    if (system == 'D35E') 
        types = [
            {value:'class', name:'Class'},
            {value:'feat', name:'Abilities'}
        ]
    else if (system == 'pf1') 
        types = [
            {value:'class', name:'Class'},
            {value:'feat', name:'Abilities'}
        ]
    else if (system == 'pf2e')
        types = [
            {value:'ancestry', name:'Ancestry'},
            {value:'background', name: 'Background'},
            {value:'class', name:'Class'},
            {value:'feat', name:'Feats'},
            {value:'action-any', name:'Actions - Any'},
            {value:'action-def', name:'Actions - Defensive'},
            {value:'action-int', name:'Actions - Interaction'},
            {value:'action-off', name:'Actions - Offensive'},
            {value:'strike', name:'Strikes'}
        ]
    else if (system == 'demonlord')
        types = [
            {value:'class', name:'Class'},
            {value:'feat', name:'Abilities'}
        ]
    else if (system == "wfrp4e") {
        types = [ {value: 'skill', name: 'Skills'}]
    }
    else if (system == "forbidden-lands") {
        types = []
    }
    else if (system == 'sfrpg')
        types = [
            {value:'class', name:'Class'},
            {value:'race', name:'Race'},
            {value:'theme', name:'Theme'},
            {value:'asi', name:'Ability Score Increases'},
            {value:'archetypes', name:'Archetypes'},
            {value:'activeFeat', name:'Active Feats'},
            {value:'passiveFeat', name:'Passive Feats'},
            {value:'actorResource', name:'Actor Resources'}
        ]
    else 
        types = [
            {value:'class', name:'Class'},
            {value:'feat', name:'Abilities'}
        ]
    return types;
}

function getSpellTypes(system) {
    let types = [];
    if (system == 'pf2e') 
        types = [
            {value:'f', name:'Focus'},
            {value:'0', name:'Cantrip'},
            {value:'1', name:'1st Level'},
            {value:'2', name:'2nd Level'},
            {value:'3', name:'3rd Level'},
            {value:'4', name:'4th Level'},
            {value:'5', name:'5th Level'},
            {value:'6', name:'6th Level'},
            {value:'7', name:'7th Level'},
            {value:'8', name:'8th Level'},
            {value:'9', name:'9th Level'},
            {value:'10', name:'10th Level'}
        ]
    else if (system == 'forbidden-lands') 
        types = []
    else if (system == 'sfrpg') 
    types = [
        {value:'innate', name:'Innate Spellcasting'},
        {value:'0', name:'0th Level'},
        {value:'1', name:'1st Level'},
        {value:'2', name:'2nd Level'},
        {value:'3', name:'3rd Level'},
        {value:'4', name:'4th Level'},
        {value:'5', name:'5th Level'},
        {value:'6', name:'6th Level'}
    ]
    else
        types = [
            {value:'0', name:'Cantrip'},
            {value:'1', name:'1st Level'},
            {value:'2', name:'2nd Level'},
            {value:'3', name:'3rd Level'},
            {value:'4', name:'4th Level'},
            {value:'5', name:'5th Level'},
            {value:'6', name:'6th Level'},
            {value:'7', name:'7th Level'},
            {value:'8', name:'8th Level'},
            {value:'9', name:'9th Level'}
        ]
    return types;
}