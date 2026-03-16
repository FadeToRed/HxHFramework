/**
 *  HxHFramework
 *
 * @description Framework principale per Hunter x Hunter Forum - GDR Remastered.
 * Deve essere caricato prima di tutti gli altri script che ne fanno uso.
 *
 * @version 1.0.0
 */

;(function() {

// ----- ----- ----- ----- ----- ----- ----- ----- ----- Guard

var HXH_DOMAINS = [
    'graficaxskinxelaborazione.forumfree.it',  // Forum di prova
    'hxhforumgdr.forumcommunity.net'           // Forum reale
];

if (HXH_DOMAINS.indexOf(location.hostname) === -1) return;

// ----- ----- ----- ----- ----- ----- ----- ----- ----- Init

window.HxHFramework = {
    constants:  {},
    groups:     {},
    location:   {},
    requests:   {},
    api:        {},
    utilities:  {
        dates:   {},
        string:  {},
        storage: {}
    }
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

/**
 * Domini riconosciuti dal framework.
 */
window.HxHFramework.constants.DOMAINS     = HXH_DOMAINS;

/**
 * Dominio attivo in questa sessione.
 */
window.HxHFramework.constants.DOMAIN      = location.hostname;

/**
 * Nome del forum.
 */
window.HxHFramework.constants.FORUM_NAME  = 'Hunter x Hunter Forum - GDR Remastered';

/**
 * ID delle sezioni fisse del forum.
 * Aggiorna gli ID con quelli reali del tuo forum.
 */
window.HxHFramework.constants.SECTIONS = {
    SPAM:           null,   // TODO: inserire ID sezione Spam
    RICAMBIO_SPAM:  null,   // TODO: inserire ID sezione Ricambio Spam
    REGOLAMENTI:    null    // TODO: inserire ID sezione Regolamenti
};

/**
 * Chiavi jsonBin — NON inserire qui i valori reali!
 * Vengono iniettate da un file separato caricato nel pannello ForumFree.
 * @see hxh-keys.js
 */
window.HxHFramework.constants.JSONBIN_MASTER_KEY = null; // iniettato da hxh-keys.js
window.HxHFramework.constants.JSONBIN_ACCESS_KEY = null; // iniettato da hxh-keys.js

// ═══════════════════════════════════════════════════════════════
// GROUPS
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica il gruppo dell'utente leggendo le classi CSS del body,
 * esattamente come fa ForumFree/ForumCommunity.
 *
 * admin = Admin
 * g1  = GDR Masters
 * g2  = GDR Mods
 * g3  = GDR Graphers × Masters
 * g4  = Graphers
 * g5  = Spammers
 * g6  = Staff in prova
 * g7  = Beta testers
 * g8  = HxH Fans
 * g9  = GDR Loyal Players
 * g10 = GDR Supporters
 * g11 = Friends
 * g12 = Close Friends
 * g13 = Staff ad honorem
 * g14 = Utility
 */

/**
 * Verifica se l'utente è Admin.
 * @returns {boolean}
 */
function isAdmin() {
    return /\badmin\b/g.test(document.body.className);
}

/**
 * Verifica se l'utente è un GDR Master (g1).
 * @returns {boolean}
 */
function isGDRMaster() {
    return /(g1)\b/g.test(document.body.className);
}

/**
 * Verifica se l'utente è un GDR Mod (g2).
 * @returns {boolean}
 */
function isGDRMod() {
    return /(g2)\b/g.test(document.body.className);
}

/**
 * Verifica se l'utente è un GDR Graphers x Master (g3).
 * @returns {boolean}
 */
function isGDRGrapherMaster() {
    return /(g3)\b/g.test(document.body.className);
}

/**
 * Verifica se l'utente è un Grapher (g4).
 * @returns {boolean}
 */
function isGrapher() {
    return /(g4)\b/g.test(document.body.className);
}

/**
 * Verifica se l'utente è Utility (g14).
 * @returns {boolean}
 */
function isUtility() {
    return /(g14)\b/g.test(document.body.className);
}

/**
 * Verifica se l'utente fa parte dello Staff
 * (Admin, GDR Masters, GDR Mods, GDR Graphers x Masters).
 * @returns {boolean}
 */
function isStaff() {
    return /\badmin\b/g.test(document.body.className) || /(g1|g2|g3)\b/g.test(document.body.className);
}

/**
 * Verifica se l'utente è registrato (qualsiasi gruppo).
 * @returns {boolean}
 */
function isUser() {
    return /(g1|g2|g3|g4|g5|g6|g7|g8|g9|g10|g11|g12|g13|g14)\b/g.test(document.body.className);
}

/**
 * Verifica se l'utente è ospite (non loggato).
 * @returns {boolean}
 */
function isGuest() {
    return !isUser();
}

window.HxHFramework.groups = {
    isAdmin:            isAdmin,
    isGDRMaster:        isGDRMaster,
    isGDRMod:           isGDRMod,
    isGDRGrapherMaster: isGDRGrapherMaster,
    isGrapher:          isGrapher,
    isUtility:          isUtility,
    isStaff:            isStaff,
    isUser:             isUser,
    isGuest:            isGuest
};

// ═══════════════════════════════════════════════════════════════
// LOCATION
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica se si è sulla homepage del forum.
 * @returns {boolean}
 */
function isHome() {
    return document.body.id === 'board';
}

/**
 * Verifica se si è in un topic.
 * @returns {boolean}
 */
function isTopic() {
    return document.body.id === 'topic';
}

/**
 * Verifica se si è in una sezione.
 * @returns {boolean}
 */
function isSection() {
    return document.body.id === 'forum';
}

/**
 * Restituisce l'ID del topic corrente, o null se non si è in un topic.
 * @returns {string|null}
 */
function getTopicId() {
    var match = location.search.match(/[?&]t=(\d+)/);
    return match ? match[1] : null;
}

/**
 * Restituisce l'ID della sezione corrente, o null se non disponibile.
 * @returns {string|null}
 */
function getSectionId() {
    var match = location.search.match(/[?&]f=(\d+)/);
    return match ? match[1] : null;
}

window.HxHFramework.location = {
    isHome:       isHome,
    isTopic:      isTopic,
    isSection:    isSection,
    getTopicId:   getTopicId,
    getSectionId: getSectionId
};

// ═══════════════════════════════════════════════════════════════
// REQUESTS
// ═══════════════════════════════════════════════════════════════

/**
 * Recupera il token di sessione 's' dal sorgente HTML della homepage.
 * Il token viene rimosso dal DOM dopo il caricamento, quindi va letto
 * dal sorgente grezzo tramite fetch.
 *
 * @param {Function} callback Funzione chiamata con il token trovato (o null)
 */
function fetchToken(callback) {
    fetch('https://' + location.hostname + '/')
        .then(function(r) { return r.text(); })
        .then(function(html) {
            var marker = 'name=' + '"s" value="';
            var start = html.indexOf(marker);
            var token = null;
            if (start !== -1) {
                start += marker.length;
                var end = html.indexOf('"', start);
                if (end !== -1) token = html.substring(start, end);
            }
            callback(token);
        })
        .catch(function() { callback(null); });
}

/**
 * Esegue una fetch con gestione charset automatica (utf-8, fallback windows-1252).
 * Restituisce il documento HTML parsato.
 *
 * @param {string} method Metodo HTTP ('GET' o 'POST')
 * @param {string} url URL della richiesta
 * @param {FormData|null} body Corpo della richiesta (per POST)
 * @param {Function} callback Funzione chiamata con il Document parsato
 */
function fetchData(method, url, body, callback) {
    fetch(url, { method: method, body: body })
        .then(function(res) {
            var contentType = res.headers.get('content-type') || '';
            var headerMatch = contentType.match(/charset=([^;\s]+)/i);
            var charset = headerMatch ? headerMatch[1].trim().toLowerCase() : null;

            return res.arrayBuffer().then(function(buffer) {
                if (!charset) {
                    try {
                        var utf8Guess = new TextDecoder('utf-8').decode(buffer);
                        var metaMatch = utf8Guess.match(/<meta[^>]+charset=["']?([^"'\s>]+)/i);
                        if (metaMatch) charset = metaMatch[1].toLowerCase();
                    } catch(e) {}
                }
                charset = charset || 'utf-8';
                var decoded;
                try {
                    decoded = new TextDecoder(charset).decode(buffer);
                } catch(e) {
                    try {
                        decoded = new TextDecoder('utf-8').decode(buffer);
                    } catch(e2) {
                        decoded = new TextDecoder('windows-1252').decode(buffer);
                    }
                }
                var parser = new DOMParser();
                callback(parser.parseFromString(decoded, 'text/html'));
            });
        })
        .catch(function(e) {
            console.error('[HxHFramework] fetchData error:', e);
        });
}

/**
 * Pubblica un nuovo commento in un topic.
 *
 * @param {string} token Token di sessione 's'
 * @param {number} sectionId ID della sezione
 * @param {number} topicId ID del topic
 * @param {string} content Contenuto del post (HTML)
 * @param {Function} callback Funzione chiamata con (ok: boolean, responseDoc: Document)
 * @param {string} [enablesig='1'] Abilita firma
 * @param {string} [track_topic='1'] Abilita tracciabilità
 */
function postComment(token, sectionId, topicId, content, callback, enablesig, track_topic) {
    enablesig   = enablesig   !== undefined ? enablesig   : '1';
    track_topic = track_topic !== undefined ? track_topic : '1';

    var formData = new FormData();
    formData.set('st',          '0');
    formData.set('act',         'Post');
    formData.set('s',           token);
    formData.set('CODE',        '03');
    formData.set('f',           sectionId);
    formData.set('t',           topicId);
    formData.set('Post',        content);
    formData.set('enablesig',   enablesig);
    formData.set('track_topic', track_topic);
    formData.set('mod_options', 'nowt');
    formData.set('charset',     'UTF-8');
    formData.set('cook' + 'ie', '1');

    fetchData('POST', 'https://' + location.hostname + '/', formData, function(doc) {
        var ok = doc && doc.location && doc.location.href
            ? doc.location.href.indexOf('saved') !== -1
            : true;
        callback(ok, doc);
    });
}

/**
 * Pubblica un nuovo topic in una sezione.
 * Recupera i parametri necessari dalla pagina di creazione topic.
 *
 * @param {number} sectionId ID della sezione
 * @param {string} title Titolo del topic
 * @param {string} content Contenuto del topic
 * @param {Function} callback Funzione chiamata con (ok: boolean, topicId: string|null)
 */
function postTopic(sectionId, title, content, callback) {
    fetch('https://' + location.hostname + '/?act=Post&CODE=00&f=' + sectionId)
        .then(function(r) { return r.text(); })
        .then(function(html) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');
            var form = doc.getElementById('REPLIER_POST');
            if (!form) { callback(false, null); return; }

            var formData = new FormData();
            formData.set('st',           form.st.value);
            formData.set('act',          form.act.value);
            formData.set('s',            form.s.value);
            formData.set('f',            form.f.value);
            formData.set('CODE',         form.CODE.value);
            formData.set('TopicTitle',   title);
            formData.set('Post',         content);
            formData.set('enablesig',    '1');
            formData.set('track_topic',  '1');
            formData.set('charset',      'UTF-8');
            if (form.MAX_FILE_SIZE) formData.set('MAX_FILE_SIZE', form.MAX_FILE_SIZE.value);
            if (form.check)         formData.set('check', form.check.value);

            return fetch('https://' + location.hostname + '/', {
                method: 'POST',
                body: formData
            }).then(function(r) { return r.text(); });
        })
        .then(function(html) {
            if (!html) return;
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');
            var match = doc.body.className.match(/t(\d+)/);
            var topicId = match ? match[1] : null;
            callback(true, topicId);
        })
        .catch(function(e) {
            console.error('[HxHFramework] postTopic error:', e);
            callback(false, null);
        });
}

window.HxHFramework.requests = {
    fetchToken:  fetchToken,
    fetchData:   fetchData,
    postComment: postComment,
    postTopic:   postTopic
};

// ═══════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════

/**
 * Restituisce i topic creati da un utente in una sezione.
 *
 * @param {number} userId ID dell'utente (default: utente loggato)
 * @param {number} sectionId ID della sezione (default: sezione corrente)
 * @param {boolean} includePinned Includi topic pinned (default: false)
 * @returns {Promise<Array>} Array di ID topic
 */
async function getUserTopicsInSection(userId, sectionId, includePinned) {
    userId        = userId       || Commons.user.id;
    sectionId     = sectionId    || Commons.location.section.id;
    includePinned = includePinned || false;

    try {
        var url = 'https://' + location.hostname + '/api.php?starter=' + userId + '&f=' + sectionId + (includePinned ? '' : '&no_pinned=1&no_annunci=1') + '&cookie=1';
        var res = await fetch(url);
        var data = await res.json();
        return data.topic_ids || [];
    } catch(e) {
        console.error('[HxHFramework] getUserTopicsInSection error:', e);
        return [];
    }
}

/**
 * Verifica se un utente ha almeno un topic in una sezione.
 *
 * @param {number} userId ID dell'utente
 * @param {number} sectionId ID della sezione
 * @returns {Promise<boolean>}
 */
async function hasUserTopicsInSection(userId, sectionId) {
    var topics = await getUserTopicsInSection(userId, sectionId);
    return topics.length > 0;
}

/**
 * Restituisce tutti i topic di una sezione.
 *
 * @param {number} sectionId ID della sezione
 * @returns {Promise<Array<{title: string, url: string}>>}
 */
async function getAllTopicsInSection(sectionId) {
    if (!sectionId) {
        console.error('[HxHFramework] getAllTopicsInSection: sectionId mancante');
        return [];
    }

    var allTopics = [];
    var page = 0;
    var hasMore = true;
    var MAX_PAGES = 50;

    try {
        while (hasMore && page < MAX_PAGES) {
            var st = page * 15;
            var res = await fetch('https://' + location.hostname + '/api.php?f=' + sectionId + '&st=' + st + '&cookie=1');
            if (!res.ok) break;
            var data = await res.json();
            if (data && data.threads && data.threads.length > 0) {
                data.threads.forEach(function(thread) {
                    allTopics.push({
                        title: thread.title,
                        url:   'https://' + location.hostname + '/?t=' + thread.id,
                        id:    thread.id
                    });
                });
                if (data.threads.length < 15) hasMore = false;
                page++;
            } else {
                hasMore = false;
            }
        }
    } catch(e) {
        console.error('[HxHFramework] getAllTopicsInSection error:', e);
    }

    return allTopics;
}

window.HxHFramework.api = {
    getUserTopicsInSection:  getUserTopicsInSection,
    hasUserTopicsInSection:  hasUserTopicsInSection,
    getAllTopicsInSection:    getAllTopicsInSection
};

// ═══════════════════════════════════════════════════════════════
// UTILITIES > DATES
// ═══════════════════════════════════════════════════════════════

/**
 * Formatta una data secondo un template.
 * Placeholder: D (giorno), M (mese), Y (anno), H (ore), I (minuti), S (secondi)
 *
 * @param {Date} date Data da formattare (default: oggi)
 * @param {string} template Template es. 'D/M/Y' o 'D/M/Y H:I'
 * @returns {string}
 *
 * @example formatDate(new Date(), 'D/M/Y') // '16/03/2026'
 */
function formatDate(date, template) {
    date     = date     || new Date();
    template = template || 'D/M/Y';

    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    var h = date.getHours();
    var i = date.getMinutes();
    var s = date.getSeconds();

    var pad = function(n) { return n < 10 ? '0' + n : '' + n; };

    return template
        .replace('D', pad(d))
        .replace('M', pad(m))
        .replace('Y', y)
        .replace('H', pad(h))
        .replace('I', pad(i))
        .replace('S', pad(s));
}

/**
 * Verifica se oggi è lo stesso giorno di una data fornita.
 *
 * @param {Date|string} day Data da confrontare
 * @returns {boolean}
 */
function isSameDay(day) {
    var today = new Date();
    var check = new Date(day);
    return today.getDate()     === check.getDate()  &&
           today.getMonth()    === check.getMonth()  &&
           today.getFullYear() === check.getFullYear();
}

/**
 * Verifica se è un nuovo giorno rispetto all'ultima volta che è stato
 * chiamato con questa chiave localStorage.
 *
 * @param {string} key Chiave localStorage da usare come riferimento
 * @returns {boolean} True se è un nuovo giorno
 */
function isNewDay(key) {
    var today = formatDate(new Date(), 'D/M/Y');
    var last  = localStorage.getItem(key);
    if (last !== today) {
        localStorage.setItem(key, today);
        return true;
    }
    return false;
}

window.HxHFramework.utilities.dates = {
    formatDate: formatDate,
    isSameDay:  isSameDay,
    isNewDay:   isNewDay
};

// ═══════════════════════════════════════════════════════════════
// UTILITIES > STRING
// ═══════════════════════════════════════════════════════════════

/**
 * Estrae il valore di un parametro da un URL.
 *
 * @param {string} url URL da cui estrarre il parametro
 * @param {string} parameter Nome del parametro
 * @returns {string|null}
 *
 * @example getURLParameter('https://forum.it/?t=12345', 't') // '12345'
 */
function getURLParameter(url, parameter) {
    var regex  = new RegExp('[?&]' + parameter + '=([^&#]*)');
    var match  = regex.exec(url);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Converte un oggetto JSON in stringa.
 * @param {Object} json
 * @returns {string}
 */
function JSONtoString(json) {
    try { return JSON.stringify(json); }
    catch(e) { return ''; }
}

/**
 * Converte una stringa JSON in oggetto.
 * @param {string} string
 * @returns {Object|null}
 */
function StringToJSON(string) {
    try { return JSON.parse(string); }
    catch(e) { return null; }
}

window.HxHFramework.utilities.string = {
    getURLParameter: getURLParameter,
    JSONtoString:    JSONtoString,
    StringToJSON:    StringToJSON
};

// ═══════════════════════════════════════════════════════════════
// UTILITIES > STORAGE
// ═══════════════════════════════════════════════════════════════

/**
 * Salva un valore nel localStorage.
 * @param {string} key
 * @param {*} value (viene serializzato in JSON se oggetto)
 */
function storageSet(key, value) {
    try {
        localStorage.setItem(key, typeof value === 'object' ? JSONtoString(value) : value);
    } catch(e) {
        console.error('[HxHFramework] storageSet error:', e);
    }
}

/**
 * Legge un valore dal localStorage.
 * @param {string} key
 * @param {boolean} parseJSON Se true, tenta di parsare il valore come JSON
 * @returns {*}
 */
function storageGet(key, parseJSON) {
    var val = localStorage.getItem(key);
    if (val === null) return null;
    if (parseJSON) return StringToJSON(val);
    return val;
}

/**
 * Rimuove un valore dal localStorage.
 * @param {string} key
 */
function storageRemove(key) {
    localStorage.removeItem(key);
}

/**
 * Verifica se una chiave esiste nel localStorage.
 * @param {string} key
 * @returns {boolean}
 */
function storageExists(key) {
    return localStorage.getItem(key) !== null;
}

window.HxHFramework.utilities.storage = {
    set:    storageSet,
    get:    storageGet,
    remove: storageRemove,
    exists: storageExists
};

// ═══════════════════════════════════════════════════════════════
// Ready
// ═══════════════════════════════════════════════════════════════

console.log('[HxHFramework] v1.0.0 — Loaded on ' + location.hostname);

})();
