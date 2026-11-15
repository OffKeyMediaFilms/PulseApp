// Browser-only video library. No upload endpoint or account is used.
export const localVideoSettings = {
 databaseName:'pulse-local-videos', databaseVersion:1,
 maxVideoBytes:256 * 1024 * 1024,
 accept:'video/*,.mp4,.mov,.webm,.m4v,.ogv',
 postingMs:1800, defaultTitle:'Video',
 // Original story scene -> numbered dashboard selection (not the same numbering).
 recordingScenes:{1:1,2:2,5:4,9:9,14:15,16:19},
 autoSaveTakes:true
};
