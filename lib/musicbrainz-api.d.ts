export { XmlMetadata } from './xml/xml-metadata';
export { XmlIsrc } from './xml/xml-isrc';
export { XmlIsrcList } from './xml/xml-isrc-list';
export { XmlRecording } from './xml/xml-recording';
import { XmlMetadata } from './xml/xml-metadata';
import * as mb from './musicbrainz.types';
export * from './musicbrainz.types';
export type RelationsIncludes = 'area-rels' | 'artist-rels' | 'event-rels' | 'instrument-rels' | 'label-rels' | 'place-rels' | 'recording-rels' | 'release-rels' | 'release-group-rels' | 'series-rels' | 'url-rels' | 'work-rels';
export type SubQueryIncludes = 
/**
 * include discids for all media in the releases
 */
'discids'
/**
 * include media for all releases, this includes the # of tracks on each medium and its format.
 */
 | 'media'
/**
 * include isrcs for all recordings
 */
 | 'isrcs'
/**
 * include artists credits for all releases and recordings
 */
 | 'artist-credits'
/**
 * include only those releases where the artist appears on one of the tracks, only valid on artists in combination with `releases`
 */
 | 'various-artists';
export type MiscIncludes = 'aliases' | 'annotation' | 'tags' | 'genres' | 'ratings' | 'media';
export type AreaIncludes = MiscIncludes | RelationsIncludes;
export type ArtistIncludes = MiscIncludes | RelationsIncludes | 'recordings' | 'releases' | 'release-groups' | 'works';
export type CollectionIncludes = MiscIncludes | RelationsIncludes | 'user-collections';
export type EventIncludes = MiscIncludes | RelationsIncludes;
export type GenreIncludes = MiscIncludes;
export type InstrumentIncludes = MiscIncludes | RelationsIncludes;
export type LabelIncludes = MiscIncludes | RelationsIncludes | 'releases';
export type PlaceIncludes = MiscIncludes | RelationsIncludes;
export type RecordingIncludes = MiscIncludes | RelationsIncludes | SubQueryIncludes | 'artists' | 'releases' | 'isrcs';
export type ReleasesIncludes = MiscIncludes | SubQueryIncludes | RelationsIncludes | 'artists' | 'collections' | 'labels' | 'recordings' | 'release-groups';
export type ReleaseGroupIncludes = MiscIncludes | SubQueryIncludes | RelationsIncludes | 'artists' | 'releases';
export type SeriesIncludes = MiscIncludes | RelationsIncludes;
export type WorkIncludes = MiscIncludes | RelationsIncludes;
export type UrlIncludes = RelationsIncludes;
export type IFormData = {
    [key: string]: string | number;
};
export interface IMusicBrainzConfig {
    botAccount: {
        username?: string;
        password?: string;
    };
    baseUrl?: string;
    appName?: string;
    appVersion?: string;
    /**
     * HTTP Proxy
     */
    proxy?: string;
    /**
     * User e-mail address or application URL
     */
    appContactInfo?: string;
    disableRateLimiting?: boolean;
}
export interface ICsrfSession {
    sessionKey: string;
    token: string;
}
export interface ISessionInformation {
    csrf: ICsrfSession;
    loggedIn?: boolean;
}
export declare class MusicBrainzApi {
    private static escapeText;
    readonly config: IMusicBrainzConfig;
    private rateLimiter;
    private options;
    private session?;
    static fetchCsrf(html: string): ICsrfSession;
    private static fetchValue;
    private getCookies;
    constructor(_config?: IMusicBrainzConfig);
    restGet<T>(relUrl: string, query?: {
        [key: string]: any;
    }, attempt?: number): Promise<T>;
    /**
     * Generic lookup function
     * @param entity
     * @param mbid
     * @param inc
     */
    lookupEntity<T, I extends string = never>(entity: mb.EntityType, mbid: string, inc?: I[]): Promise<T>;
    /**
     * Lookup area
     * @param areaId Area MBID
     * @param inc Sub-queries
     */
    lookupArea(areaId: string, inc?: AreaIncludes[]): Promise<mb.IArea>;
    /**
     * Lookup artist
     * @param artistId Artist MBID
     * @param inc Sub-queries
     */
    lookupArtist(artistId: string, inc?: ArtistIncludes[]): Promise<mb.IArtist>;
    /**
     * Lookup collection
     * @param collectionId Collection MBID
     * @param inc List of additional information to be included about the entity. Any of the entities directly linked to the entity can be included.
     */
    lookupCollection(collectionId: string, inc?: ArtistIncludes[]): Promise<mb.ICollection>;
    /**
     * Lookup instrument
     * @param artistId Instrument MBID
     * @param inc Sub-queries
     */
    lookupInstrument(instrumentId: string, inc?: InstrumentIncludes[]): Promise<mb.IInstrument>;
    /**
     * Lookup label
     * @param labelId Area MBID
     * @param inc Sub-queries
     */
    lookupLabel(labelId: string, inc?: LabelIncludes[]): Promise<mb.ILabel>;
    /**
     * Lookup place
     * @param placeId Area MBID
     * @param inc Sub-queries
     */
    lookupPlace(placeId: string, inc?: PlaceIncludes[]): Promise<mb.IPlace>;
    /**
     * Lookup release
     * @param releaseId Release MBID
     * @param inc Include: artist-credits, labels, recordings, release-groups, media, discids, isrcs (with recordings)
     * ToDo: ['recordings', 'artists', 'artist-credits', 'isrcs', 'url-rels', 'release-groups']
     */
    lookupRelease(releaseId: string, inc?: ReleasesIncludes[]): Promise<mb.IRelease>;
    /**
     * Lookup release-group
     * @param releaseGroupId Release-group MBID
     * @param inc Include: ToDo
     */
    lookupReleaseGroup(releaseGroupId: string, inc?: ReleaseGroupIncludes[]): Promise<mb.IReleaseGroup>;
    /**
     * Lookup recording
     * @param recordingId Label MBID
     * @param inc Include: artist-credits, isrcs
     */
    lookupRecording(recordingId: string, inc?: RecordingIncludes[]): Promise<mb.IRecording>;
    /**
     * Lookup series
     * @param seriesId Series MBID
     */
    lookupSeries(seriesId: string): Promise<mb.ISeries>;
    /**
     * Lookup work
     * @param workId Work MBID
     */
    lookupWork(workId: string, inc?: WorkIncludes[]): Promise<mb.IWork>;
    /**
     * Lookup URL
     * @param urlId URL MBID
     */
    lookupUrl(urlId: string, inc?: UrlIncludes[]): Promise<mb.IUrl>;
    /**
     * Lookup Event
     * @param eventId Event MBID
     * @param eventIncludes List of sub-queries to enable
     */
    lookupEvent(eventId: string, eventIncludes?: EventIncludes[]): Promise<mb.IEvent>;
    /**
     * Generic browse function
     * https://wiki.musicbrainz.org/Development/JSON_Web_Service#Browse_Requests
     * @param entity MusicBrainz entity
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseEntity<T>(entity: mb.EntityType, query?: {
        [key: string]: any;
    }): Promise<T>;
    /**
     * Browse areas
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseAreas(query?: mb.IBrowseAreasQuery): Promise<mb.IBrowseAreasResult>;
    /**
     * Browse artists
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseArtists(query?: mb.IBrowseArtistsQuery): Promise<mb.IBrowseArtistsResult>;
    /**
     * Browse collections
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseCollections(query?: mb.IBrowseCollectionsQuery): Promise<mb.IBrowseCollectionsResult>;
    /**
     * Browse events
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseEvents(query?: mb.IBrowseEventsQuery): Promise<mb.IBrowseEventsResult>;
    /**
     * Browse instruments
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseInstruments(query?: mb.IBrowseInstrumentsQuery): Promise<mb.IBrowseInstrumentsResult>;
    /**
     * Browse labels
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseLabels(query?: mb.IBrowseLabelsQuery): Promise<mb.IBrowseLabelsResult>;
    /**
     * Browse places
     * @param query Query, like: {<entity>: <MBID:}
     */
    browsePlaces(query?: mb.IBrowsePlacesQuery): Promise<mb.IBrowsePlacesResult>;
    /**
     * Browse recordings
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseRecordings(query?: mb.IBrowseRecordingsQuery): Promise<mb.IBrowseRecordingsResult>;
    /**
     * Browse releases
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseReleases(query?: mb.IBrowseReleasesQuery): Promise<mb.IBrowseReleasesResult>;
    /**
     * Browse release-groups
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseReleaseGroups(query?: mb.IReleaseGroupsQuery): Promise<mb.IBrowseReleaseGroupsResult>;
    /**
     * Browse series
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseSeries(query?: mb.IBrowseSeriesQuery): Promise<mb.IBrowseSeriesResult>;
    /**
     * Browse works
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseWorks(query?: mb.IBrowseWorksQuery): Promise<mb.IBrowseWorksResult>;
    /**
     * Browse URLs
     * @param query Query, like: {<entity>: <MBID:}
     */
    browseUrls(query?: mb.IBrowseUrlsQuery): Promise<mb.IUrl>;
    postRecording(xmlMetadata: XmlMetadata): Promise<void>;
    post(entity: mb.EntityType, xmlMetadata: XmlMetadata): Promise<void>;
    login(): Promise<boolean>;
    /**
     * Logout
     */
    logout(): Promise<boolean>;
    /**
     * Submit entity
     * @param entity Entity type e.g. 'recording'
     * @param mbid
     * @param formData
     */
    editEntity(entity: mb.EntityType, mbid: string, formData: Record<string, any>): Promise<void>;
    /**
     * Set URL to recording
     * @param recording Recording to update
     * @param url2add URL to add to the recording
     * @param editNote Edit note
     */
    addUrlToRecording(recording: mb.IRecording, url2add: {
        linkTypeId: mb.LinkType;
        text: string;
    }, editNote?: string): Promise<void>;
    /**
     * Add ISRC to recording
     * @param recording Recording to update
     * @param isrc ISRC code to add
     * @param editNote Edit note
     */
    addIsrc(recording: mb.IRecording, isrc: string, editNote?: string): Promise<void>;
    /**
     * Search an entity using a search query
     * @param query e.g.: '" artist: Madonna, track: Like a virgin"' or object with search terms: {artist: Madonna}
     * @param entity e.g. 'recording'
     * @param query Arguments
     */
    search<T extends mb.ISearchResult, I extends string = never>(entity: mb.EntityType, query: mb.ISearchQuery<I>): Promise<T>;
    /**
     * Add Spotify-ID to MusicBrainz recording.
     * This function will automatically lookup the recording title, which is required to submit the recording URL
     * @param recording MBID of the recording
     * @param spotifyId Spotify ID
     * @param editNote Comment to add.
     */
    addSpotifyIdToRecording(recording: mb.IRecording, spotifyId: string, editNote: string): Promise<void>;
    searchArea(query: mb.ISearchQuery<AreaIncludes> & mb.ILinkedEntitiesArea): Promise<mb.IAreaList>;
    searchArtist(query: mb.ISearchQuery<ArtistIncludes> & mb.ILinkedEntitiesArtist): Promise<mb.IArtistList>;
    searchRelease(query: mb.ISearchQuery<ReleasesIncludes> & mb.ILinkedEntitiesRelease): Promise<mb.IReleaseList>;
    searchReleaseGroup(query: mb.ISearchQuery<ReleaseGroupIncludes> & mb.ILinkedEntitiesReleaseGroup): Promise<mb.IReleaseGroupList>;
    searchUrl(query: mb.ISearchQuery<UrlIncludes> & mb.ILinkedEntitiesUrl): Promise<mb.IUrlList>;
    private getSession;
}
export declare function makeAndQueryString(keyValuePairs: IFormData): string;
