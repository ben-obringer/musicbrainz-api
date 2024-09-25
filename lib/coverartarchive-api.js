"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverArtArchiveApi = void 0;
/* eslint-disable-next-line */
const got_1 = require("got");
class CoverArtArchiveApi {
    constructor() {
        this.host = 'coverartarchive.org';
    }
    async getJson(path) {
        const response = await got_1.default.get('https://' + this.host + path, {
            headers: {
                Accept: `application/json`
            },
            responseType: 'json'
        });
        return response.body;
    }
    /**
     *
     * @param releaseId MusicBrainz Release MBID
     */
    async getReleaseCovers(releaseId, coverType) {
        const path = ['release', releaseId];
        if (coverType) {
            path.push(coverType);
        }
        const info = await this.getJson('/' + path.join('/'));
        // Hack to correct http addresses into https
        if (info.release && info.release.startsWith('http:')) {
            info.release = 'https' + info.release.substring(4);
        }
        return info;
    }
}
exports.CoverArtArchiveApi = CoverArtArchiveApi;
//# sourceMappingURL=coverartarchive-api.js.map