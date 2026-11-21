// ==========================================
// BOLOSAATHI MUSIC CONTROLLER
// ==========================================

const searchSongs = async (req, res) => {

    try {

        const { query } = req.query;

        // Validate search query
        if (!query || !query.trim()) {

            return res.status(400).json({
                success: false,
                message: "Please enter a song name or artist."
            });

        }

        // Check YouTube API key
        if (!process.env.YOUTUBE_API_KEY) {

            return res.status(500).json({
                success: false,
                message: "YouTube API key is missing."
            });

        }

        // YouTube Data API URL
        const youtubeURL = new URL(
            "https://www.googleapis.com/youtube/v3/search"
        );

        youtubeURL.search = new URLSearchParams({

            part: "snippet",

            q: query.trim(),

            type: "video",

            videoEmbeddable: "true",

            videoSyndicated: "true",

            safeSearch: "moderate",

            maxResults: "10",

            key: process.env.YOUTUBE_API_KEY

        }).toString();


        // Request songs from YouTube
        const response = await fetch(youtubeURL);

        const data = await response.json();


        // Handle YouTube API errors
        if (!response.ok) {

            console.error("YouTube API Error:", data);

            return res.status(response.status).json({

                success: false,

                message:
                    data.error?.message ||
                    "Unable to search songs right now."

            });

        }


        // Format song results
        const songs = (data.items || [])

            .filter(item => item.id?.videoId)

            .map(item => ({

                videoId: item.id.videoId,

                title: item.snippet.title,

                artist: item.snippet.channelTitle,

                thumbnail:
                    item.snippet.thumbnails?.high?.url ||
                    item.snippet.thumbnails?.medium?.url ||
                    item.snippet.thumbnails?.default?.url,

                description: item.snippet.description,

                publishedAt: item.snippet.publishedAt

            }));


        // Send response
        return res.status(200).json({

            success: true,

            query,

            totalResults: songs.length,

            songs

        });

    } catch (error) {

        console.error("Music Search Error:", error);

        return res.status(500).json({

            success: false,

            message: "Something went wrong while searching for songs."

        });

    }

};


module.exports = {
    searchSongs
};