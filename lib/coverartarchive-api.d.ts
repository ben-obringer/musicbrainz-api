export type CovertType = 'Front' | 'Back' | 'Booklet' | 'Medium' | 'Obi' | 'Spine' | 'Track' | 'Tray' | 'Sticker' | 'Poster' | 'Liner' | 'Watermark' | 'Raw/Unedited' | 'Matrix/Runout' | 'Top' | 'Bottom' | 'Other';
export interface IImage {
    types: CovertType[];
    front: boolean;
    back: boolean;
    edit: number;
    image: string;
    comment: string;
    approved: boolean;
    id: string;
    thumbnails: {
        large: string;
        small: string;
        '250': string;
        '500'?: string;
        '1200'?: string;
    };
}
export interface ICoverInfo {
    images: IImage[];
    release: string;
}
export declare class CoverArtArchiveApi {
    private host;
    private getJson;
    /**
     *
     * @param releaseId MusicBrainz Release MBID
     */
    getReleaseCovers(releaseId: string, coverType?: 'front' | 'back'): Promise<ICoverInfo>;
}
