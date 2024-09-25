"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAndQueryString = exports.MusicBrainzApi = exports.XmlRecording = exports.XmlIsrcList = exports.XmlIsrc = exports.XmlMetadata = void 0;
const assert = require("assert");
const http_status_codes_1 = require("http-status-codes");
const Url = require("url");
const Debug = require("debug");
var xml_metadata_1 = require("./xml/xml-metadata");
Object.defineProperty(exports, "XmlMetadata", { enumerable: true, get: function () { return xml_metadata_1.XmlMetadata; } });
var xml_isrc_1 = require("./xml/xml-isrc");
Object.defineProperty(exports, "XmlIsrc", { enumerable: true, get: function () { return xml_isrc_1.XmlIsrc; } });
var xml_isrc_list_1 = require("./xml/xml-isrc-list");
Object.defineProperty(exports, "XmlIsrcList", { enumerable: true, get: function () { return xml_isrc_list_1.XmlIsrcList; } });
var xml_recording_1 = require("./xml/xml-recording");
Object.defineProperty(exports, "XmlRecording", { enumerable: true, get: function () { return xml_recording_1.XmlRecording; } });
const digest_auth_1 = require("./digest-auth");
const rate_limiter_1 = require("./rate-limiter");
const mb = require("./musicbrainz.types");
/* eslint-disable-next-line */
const got_1 = require("got");
const tough_cookie_1 = require("tough-cookie");
__exportStar(require("./musicbrainz.types"), exports);
const util_1 = require("util");
const debug = Debug('musicbrainz-api');
class MusicBrainzApi {
    static escapeText(text) {
        let str = '';
        for (const chr of text) {
            // Escaping Special Characters: + - && || ! ( ) { } [ ] ^ " ~ * ? : \ /
            // ToDo: && ||
            switch (chr) {
                case '+':
                case '-':
                case '!':
                case '(':
                case ')':
                case '{':
                case '}':
                case '[':
                case ']':
                case '^':
                case '"':
                case '~':
                case '*':
                case '?':
                case ':':
                case '\\':
                case '/':
                    str += '\\';
            }
            str += chr;
        }
        return str;
    }
    static fetchCsrf(html) {
        return {
            sessionKey: MusicBrainzApi.fetchValue(html, 'csrf_session_key'),
            token: MusicBrainzApi.fetchValue(html, 'csrf_token')
        };
    }
    static fetchValue(html, key) {
        let pos = html.indexOf(`name="${key}"`);
        if (pos >= 0) {
            pos = html.indexOf('value="', pos + key.length + 7);
            if (pos >= 0) {
                pos += 7;
                const endValuePos = html.indexOf('"', pos);
                const value = html.substring(pos, endValuePos);
                return value;
            }
        }
    }
    constructor(_config) {
        this.config = {
            baseUrl: 'https://musicbrainz.org',
            botAccount: {}
        };
        Object.assign(this.config, _config);
        const cookieJar = new tough_cookie_1.CookieJar();
        this.getCookies = (0, util_1.promisify)(cookieJar.getCookies.bind(cookieJar));
        this.options = {
            prefixUrl: this.config.baseUrl,
            timeout: 20 * 1000,
            headers: {
                'User-Agent': `${this.config.appName}/${this.config.appVersion} ( ${this.config.appContactInfo} )`
            },
            cookieJar: cookieJar
        };
        this.rateLimiter = new rate_limiter_1.RateLimiter(15, 18);
    }
    async restGet(relUrl, query = {}, attempt = 1) {
        query.fmt = 'json';
        if (!this.config.disableRateLimiting) {
            await this.rateLimiter.limit();
        }
        const response = await got_1.default.get('ws/2' + relUrl, Object.assign(Object.assign({}, this.options), { searchParams: query, responseType: 'json', retry: {
                limit: 10
            } }));
        return response.body;
    }
    // -----------------------------------------------------------------------------------------------------------------
    // Lookup functions
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Generic lookup function
     * @param entity
     * @param mbid
     * @param inc
     */
    lookupEntity(entity, mbid, inc = []) {
        return this.restGet(`/${entity}/${mbid}`, { inc: inc.join(' ') });
    }
    /**
     * Lookup area
     * @param areaId Area MBID
     * @param inc Sub-queries
     */
    lookupArea(areaId, inc = []) {
        return this.lookupEntity('area', areaId, inc);
    }
    /**
     * Lookup artist
     * @param artistId Artist MBID
     * @param inc Sub-queries
     */
    lookupArtist(artistId, inc = []) {
        return this.lookupEntity('artist', artistId, inc);
    }
    /**
     * Lookup collection
     * @param collectionId Collection MBID
     * @param inc List of additional information to be included about the entity. Any of the entities directly linked to the entity can be included.
     */
    lookupCollection(collectionId, inc = []) {
        return this.lookupEntity('collection', collectionId, inc);
    }
    /**
     * Lookup instrument
     * @param artistId Instrument MBID
     * @param inc Sub-queries
     */
    lookupInstrument(instrumentId, inc = []) {
        return this.lookupEntity('instrument', instrumentId, inc);
    }
    /**
     * Lookup label
     * @param labelId Area MBID
     * @param inc Sub-queries
     */
    lookupLabel(labelId, inc = []) {
        return this.lookupEntity('label', labelId, inc);
    }
    /**
     * Lookup place
     * @param placeId Area MBID
     * @param inc Sub-queries
     */
    lookupPlace(placeId, inc = []) {
        return this.lookupEntity('place', placeId, inc);
    }
    /**
     * Lookup release
     * @param releaseId Release MBID
     * @param inc Include: artist-credits, labels, recordings, release-groups, media, discids, isrcs (with recordings)
     * ToDo: ['recordings', 'artists', 'artist-credits', 'isrcs', 'url-rels', 'release-groups']
     */
    lookupRelease(releaseId, inc = []) {
        return this.lookupEntity('release', releaseId, inc);
    }
    /**
     * Lookup release-group
     * @param releaseGroupId Release-group MBID
     * @param inc Include: ToDo
     */
    lookupReleaseGroup(releaseGroupId, inc = []) {
        return this.lookupEntity('release-group', releaseGroupId, inc);
    }
    /**
     * Lookup recording
     * @param recordingId Label MBID
     * @param inc Include: artist-credits, isrcs
     */
    lookupRecording(recordingId, inc = []) {
        return this.lookupEntity('recording', recordingId, inc);
    }
    /**
     * Lookup series
     * @param seriesId Series MBID
     */
    lookupSeries(seriesId) {
        return this.lookupEntity('series', seriesId);
    }
    /**
     * Lookup work
     * @param workId Work MBID
     */
    lookupWork(workId, inc = []) {
        return this.lookupEntity('work', workId, inc);
    }
    /**
     * Lookup URL
     * @param urlId URL MBID
     */
    lookupUrl(urlId, inc = []) {
        return this.lookupEntity('url', urlId, inc);
    }
    /**
     * Lookup Event
     * @param eventId Event MBID
     * @param eventIncludes List of sub-queries to enable
     */
    lookupEvent(eventId, eventIncludes = []) {
        return this.lookupEntity('event', eventId, eventIncludes);
    }
    // -----------------------------------------------------------------------------------------------------------------
    // Browse functions
    // -----------------------------------------------------------------------------------------------------------------
    // https://wiki.musicbrainz.org/MusicBrainz_API#Browse
    // https://wiki.musicbrainz.org/MusicBrainz_API#Linked_entities
    // For example: http://musicbrainz.org/ws/2/release?label=47e718e1-7ee4-460c-b1cc-1192a841c6e5&offset=12&limit=2
    /**
     * Generic browse function
     * https://wiki.musicbrainz.org/Development/JSON_Web_Service#Browse_Requests
     * @param entity MusicBrainz entity
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseEntity(entity, query) {
        return this.restGet(`/${entity}`, query);
    }
    /**
     * Browse areas
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseAreas(query) {
        return this.browseEntity('area', query);
    }
    /**
     * Browse artists
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseArtists(query) {
        return this.browseEntity('artist', query);
    }
    /**
     * Browse collections
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseCollections(query) {
        return this.browseEntity('collection', query);
    }
    /**
     * Browse events
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseEvents(query) {
        return this.browseEntity('event', query);
    }
    /**
     * Browse instruments
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseInstruments(query) {
        return this.browseEntity('instrument', query);
    }
    /**
     * Browse labels
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseLabels(query) {
        return this.browseEntity('label', query);
    }
    /**
     * Browse places
     * @param query Query, like: {<entity>: <MBID:}
     */
    browsePlaces(query) {
        return this.browseEntity('place', query);
    }
    /**
     * Browse recordings
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseRecordings(query) {
        return this.browseEntity('recording', query);
    }
    /**
     * Browse releases
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseReleases(query) {
        return this.browseEntity('release', query);
    }
    /**
     * Browse release-groups
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseReleaseGroups(query) {
        return this.browseEntity('release-group', query);
    }
    /**
     * Browse series
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseSeries(query) {
        return this.browseEntity('series', query);
    }
    /**
     * Browse works
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseWorks(query) {
        return this.browseEntity('work', query);
    }
    /**
     * Browse URLs
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseUrls(query) {
        return this.browseEntity('url', query);
    }
    // ---------------------------------------------------------------------------
    async postRecording(xmlMetadata) {
        return this.post('recording', xmlMetadata);
    }
    async post(entity, xmlMetadata) {
        if (!this.config.appName || !this.config.appVersion) {
            throw new Error(`XML-Post requires the appName & appVersion to be defined`);
        }
        const clientId = `${this.config.appName.replace(/-/g, '.')}-${this.config.appVersion}`;
        const path = `ws/2/${entity}/`;
        // Get digest challenge
        let digest;
        let n = 1;
        const postData = xmlMetadata.toXml();
        do {
            if (!this.config.disableRateLimiting) {
                await this.rateLimiter.limit();
            }
            const response = await got_1.default.post(path, Object.assign(Object.assign({}, this.options), { searchParams: { client: clientId }, headers: {
                    authorization: digest,
                    'Content-Type': 'application/xml'
                }, body: postData, throwHttpErrors: false }));
            if (response.statusCode === http_status_codes_1.StatusCodes.UNAUTHORIZED) {
                // Respond to digest challenge
                const auth = new digest_auth_1.DigestAuth(this.config.botAccount);
                const relPath = Url.parse(response.requestUrl).path; // Ensure path is relative
                digest = auth.digest(response.request.method, relPath, response.headers['www-authenticate']);
                ++n;
            }
            else {
                break;
            }
        } while (n++ < 5);
    }
    async login() {
        assert.ok(this.config.botAccount.username, 'bot username should be set');
        assert.ok(this.config.botAccount.password, 'bot password should be set');
        if (this.session && this.session.loggedIn) {
            for (const cookie of await this.getCookies(this.options.prefixUrl)) {
                if (cookie.key === 'remember_login') {
                    return true;
                }
            }
        }
        this.session = await this.getSession();
        const redirectUri = '/success';
        const formData = {
            username: this.config.botAccount.username,
            password: this.config.botAccount.password,
            csrf_session_key: this.session.csrf.sessionKey,
            csrf_token: this.session.csrf.token,
            remember_me: 1
        };
        const response = await got_1.default.post('login', Object.assign(Object.assign({}, this.options), { followRedirect: false, searchParams: {
                returnto: redirectUri
            }, form: formData }));
        const success = response.statusCode === http_status_codes_1.StatusCodes.MOVED_TEMPORARILY && response.headers.location === redirectUri;
        if (success) {
            this.session.loggedIn = true;
        }
        return success;
    }
    /**
     * Logout
     */
    async logout() {
        const redirectUri = '/success';
        const response = await got_1.default.get('logout', Object.assign(Object.assign({}, this.options), { followRedirect: false, searchParams: {
                returnto: redirectUri
            } }));
        const success = response.statusCode === http_status_codes_1.StatusCodes.MOVED_TEMPORARILY && response.headers.location === redirectUri;
        if (success && this.session) {
            this.session.loggedIn = true;
        }
        return success;
    }
    /**
     * Submit entity
     * @param entity Entity type e.g. 'recording'
     * @param mbid
     * @param formData
     */
    async editEntity(entity, mbid, formData) {
        if (!this.config.disableRateLimiting) {
            await this.rateLimiter.limit();
        }
        this.session = await this.getSession();
        formData.csrf_session_key = this.session.csrf.sessionKey;
        formData.csrf_token = this.session.csrf.token;
        formData.username = this.config.botAccount.username;
        formData.password = this.config.botAccount.password;
        formData.remember_me = 1;
        const response = await got_1.default.post(`${entity}/${mbid}/edit`, Object.assign(Object.assign({}, this.options), { form: formData, followRedirect: false }));
        if (response.statusCode === http_status_codes_1.StatusCodes.OK)
            throw new Error(`Failed to submit form data`);
        if (response.statusCode === http_status_codes_1.StatusCodes.MOVED_TEMPORARILY)
            return;
        throw new Error(`Unexpected status code: ${response.statusCode}`);
    }
    /**
     * Set URL to recording
     * @param recording Recording to update
     * @param url2add URL to add to the recording
     * @param editNote Edit note
     */
    async addUrlToRecording(recording, url2add, editNote = '') {
        var _a;
        const formData = {};
        formData['edit-recording.name'] = recording.title; // Required
        formData['edit-recording.comment'] = recording.disambiguation;
        formData['edit-recording.make_votable'] = true;
        formData['edit-recording.url.0.link_type_id'] = url2add.linkTypeId;
        formData['edit-recording.url.0.text'] = url2add.text;
        (_a = recording.isrcs) === null || _a === void 0 ? void 0 : _a.forEach((isrcs, i) => {
            formData[`edit-recording.isrcs.${i}`] = isrcs;
        });
        formData['edit-recording.edit_note'] = editNote;
        return this.editEntity('recording', recording.id, formData);
    }
    /**
     * Add ISRC to recording
     * @param recording Recording to update
     * @param isrc ISRC code to add
     * @param editNote Edit note
     */
    async addIsrc(recording, isrc, editNote = '') {
        const formData = {};
        formData[`edit-recording.name`] = recording.title; // Required
        if (!recording.isrcs) {
            throw new Error('You must retrieve recording with existing ISRC values');
        }
        if (recording.isrcs.indexOf(isrc) === -1) {
            recording.isrcs.push(isrc);
            for (const i in recording.isrcs) {
                formData[`edit-recording.isrcs.${i}`] = recording.isrcs[i];
            }
            return this.editEntity('recording', recording.id, formData);
        }
    }
    // -----------------------------------------------------------------------------------------------------------------
    // Query functions
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Search an entity using a search query
     * @param query e.g.: '" artist: Madonna, track: Like a virgin"' or object with search terms: {artist: Madonna}
     * @param entity e.g. 'recording'
     * @param query Arguments
     */
    search(entity, query) {
        const urlQuery = Object.assign({}, query);
        if (typeof query.query === 'object') {
            urlQuery.query = makeAndQueryString(query.query);
        }
        if (Array.isArray(query.inc)) {
            urlQuery.inc = urlQuery.inc.join(' ');
        }
        return this.restGet('/' + entity + '/', urlQuery);
    }
    // -----------------------------------------------------------------------------------------------------------------
    // Helper functions
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Add Spotify-ID to MusicBrainz recording.
     * This function will automatically lookup the recording title, which is required to submit the recording URL
     * @param recording MBID of the recording
     * @param spotifyId Spotify ID
     * @param editNote Comment to add.
     */
    addSpotifyIdToRecording(recording, spotifyId, editNote) {
        assert.strictEqual(spotifyId.length, 22);
        return this.addUrlToRecording(recording, {
            linkTypeId: mb.LinkType.stream_for_free,
            text: 'https://open.spotify.com/track/' + spotifyId
        }, editNote);
    }
    searchArea(query) {
        return this.search('area', query);
    }
    searchArtist(query) {
        return this.search('artist', query);
    }
    searchRelease(query) {
        return this.search('release', query);
    }
    searchReleaseGroup(query) {
        return this.search('release-group', query);
    }
    searchUrl(query) {
        return this.search('url', query);
    }
    async getSession() {
        const response = await got_1.default.get('login', Object.assign(Object.assign({}, this.options), { followRedirect: false, responseType: 'text' }));
        return {
            csrf: MusicBrainzApi.fetchCsrf(response.body)
        };
    }
}
exports.MusicBrainzApi = MusicBrainzApi;
function makeAndQueryString(keyValuePairs) {
    return Object.keys(keyValuePairs).map(key => `${key}:"${keyValuePairs[key]}"`).join(' AND ');
}
exports.makeAndQueryString = makeAndQueryString;
//# sourceMappingURL=musicbrainz-api.js.map