type HeatmapPoint = {
    start_time: number;
    end_time: number;
    value: number;
};

type SubtitleFormat = {
    ext: string;
    url: string;
    name: string;
};

type ThumbnailInfo = {
    url: string;
    preference?: number;
    id?: string;
    height?: number;
    width?: number;
    resolution?: string;
};

type VideoFormat = {
    format_id: string;
    format_note?: string;
    format_index?: number | null;
    url: string;
    manifest_url?: string;
    ext: string;
    protocol: string;
    preference?: number | null;
    quality?: number;
    has_drm?: boolean;
    vcodec?: string;
    acodec?: string;
    width?: number | null;
    height?: number | null;
    fps?: number | null;
    vbr?: number;
    abr?: number;
    tbr?: number | null;
    filesize?: number;
    filesize_approx?: number | null;
    resolution?: string;
    aspect_ratio?: number | null;
    audio_ext?: string;
    video_ext?: string;
    language?: string;
    language_preference?: number;
    source_preference?: number;
    dynamic_range?: string | null;
    container?: string;
    downloader_options?: {
        http_chunk_size?: number;
    };
    http_headers: {
        "User-Agent": string;
        Accept: string;
        "Accept-Language": string;
        "Sec-Fetch-Mode": string;
    };
    format: string;
    // Storyboard specific fields
    rows?: number;
    columns?: number;
    fragments?: Array<{
        url: string;
        duration: number;
    }>;
    // Audio specific fields
    asr?: number;
    audio_channels?: number;
};

type GetInfoResponse = {
    ok: boolean;
    data: VideoInfo;
};

type VideoInfo = {
    id: string;
    title: string;
    formats: VideoFormat[];
    thumbnails?: ThumbnailInfo[];
    thumbnail?: string;
    description?: string;
    uploader?: string;
    uploader_id?: string;
    uploader_url?: string;
    channel?: string;
    channel_id?: string;
    channel_url?: string;
    channel_follower_count?: number;
    duration?: number;
    duration_string?: string;
    view_count?: number;
    like_count?: number;
    comment_count?: number;
    upload_date?: string;
    timestamp?: number;
    availability?: string;
    age_limit?: number;
    webpage_url?: string;
    webpage_url_basename?: string;
    webpage_url_domain?: string;
    original_url?: string;
    extractor?: string;
    extractor_key?: string;
    playlist?: string | null;
    playlist_index?: number | null;
    display_id?: string;
    fulltitle?: string;
    release_year?: number | null;
    is_live?: boolean;
    was_live?: boolean;
    requested_subtitles?: any;
    subtitles?: Record<string, SubtitleFormat[]>;
    automatic_captions?: Record<string, SubtitleFormat[]>;
    chapters?: any;
    heatmap?: HeatmapPoint[];
    tags?: string[];
    categories?: string[];
    _has_drm?: boolean | null;
    epoch?: number;
    requested_formats?: VideoFormat[];
    format?: string;
    format_id?: string;
    ext?: string;
    protocol?: string;
    language?: string;
    format_note?: string;
    filesize_approx?: number;
    tbr?: number;
    width?: number;
    height?: number;
    resolution?: string;
    fps?: number;
    dynamic_range?: string;
    vcodec?: string;
    vbr?: number;
    stretched_ratio?: any;
    aspect_ratio?: number;
    acodec?: string;
    abr?: number;
    asr?: number;
    audio_channels?: number;
    _filename?: string;
    filename?: string;
    _type?: string;
    _version?: {
        version: string;
        current_git_head?: string | null;
        release_git_head?: string;
        repository?: string;
    };
};

declare global {
    interface Window {
        extendr: {
            /**
             * Add extensions to a destination.
             * @param directories - Array of directory paths containing extensions to add.
             * @returns Promise with operation result and content array.
             */
            addExtensions: (directories: string[]) => Promise<{
                ok: boolean;
                content?: any[];
                error?: string;
            }>;

            /**
             * Find extensions in the system.
             * @param extendedNames - Array of extended names to find.
             * @returns Promise that resolves when search is complete.
             */
            findExtensions: (extendedNames: string[]) => Promise<any>;

            /**
             * Get all available extensions.
             * @returns Promise with array of extensions.
             */
            getExtensions: () => Promise<any[]>;

            /**
             * Called when the extension wants to get the info of a video.
             * @param videoUrl - The URL of the video to get the info of.
             * @returns The info of the video.
             */
            getInfo: (videoUrl: string) => Promise<GetInfoResponse>;

            /**
             * Kill a download controller.
             * @param controllerId - The ID of the controller to kill.
             * @returns Promise that resolves to boolean indicating success.
             */
            killController: (controllerId: string) => Promise<boolean>;

            /**
             * Get the current load order of extensions.
             * @returns Promise with array of load order items.
             */
            getLoadOrder: () => Promise<any[]>;

            /**
             * Set the load order of extensions.
             * @param loadOrderItems - Array of load order items to set.
             * @returns Promise with operation result.
             */
            setLoadOrder: (loadOrderItems: any[]) => Promise<{
                ok: boolean;
                error?: string;
            }>;

            download: (
                payload: {
                    url: string;
                    outputFilepath: string;
                    videoFormat: string;
                    remuxVideo: string;
                    audioExt: string;
                    audioFormatId: string;
                    limitRate: string;
                },
                progressCallback: (downloadId: string, args: any) => void
            ) => Promise<{
                /**
                 * The ID of the download.
                 */
                downloadId: string;
                /**
                 * The ID of the controller.
                 */
                controllerId: string;
                /**
                 * The additional properties of the download.
                 */
                [key: string]: any;
            }>;

            extensions: {
                [key: string]: {
                    [key: string]: (...args: any[]) => Promise<any>;
                };
            };
        };
    }
}

export {};
