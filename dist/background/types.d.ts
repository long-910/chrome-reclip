export interface ThumbnailInfo {
    type: 'youtube' | 'x' | 'other';
    videoId?: string;
}
export interface SavedVideo {
    id: string;
    url: string;
    title: string;
    domain: string;
    savedAt: string;
    thumbnailInfo: ThumbnailInfo;
}
export interface StorageData {
    items: SavedVideo[];
}
