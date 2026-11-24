import React, { useState, useRef, useEffect } from "react";

import {
    Search,
    Music,
    Play,
    Pause,
    SkipForward,
    X,
    Mic,
    MicOff,
    TrendingUp,
    Clock,
    Headphones,
    Heart,
    Sparkles
} from "lucide-react";
import { API_URL } from "./api";

import "./MusicPlayer.css";

function MusicPlayer({ onClose }) {

    const [query, setQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);

    const [trendingSongs, setTrendingSongs] = useState([]);

    const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("bolosaathi_recent_songs") || "[]"
            );
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(false);
    const [trendingLoading, setTrendingLoading] = useState(true);
    const [error, setError] = useState("");
    const [listening, setListening] = useState(false);

    const recognitionRef = useRef(null);
    const searchTimerRef = useRef(null);

    // =====================================
    // FETCH SONGS FROM YOUTUBE
    // =====================================

    const fetchSongs = async (searchText) => {
const response = await fetch(
    `${API_URL}/music/search?query=${encodeURIComponent(searchText)}`
);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Song search failed.");
        }

        return data.songs || [];

    };


    // =====================================
    // SEARCH SONGS
    // =====================================

    const searchSongs = async (searchText = query) => {

        const searchQuery = searchText.trim();

        if (!searchQuery) return;

        clearTimeout(searchTimerRef.current);

        setQuery(searchQuery);
        setLoading(true);
        setError("");
        setSongs([]);

        try {

            const results = await fetchSongs(searchQuery);

            setSongs(results);

            if (results.length === 0) {
                setError("No matching songs found. Try another search.");
            }

        } catch (err) {

            console.error("Music search error:", err);
            setError(err.message || "Unable to search songs.");

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // AUTOMATIC SEARCH
    // =====================================

    useEffect(() => {

        const searchText = query.trim();

        if (searchText.length < 2) {
            setSongs([]);
            setError("");
            return;
        }

        searchTimerRef.current = setTimeout(() => {
            searchSongs(searchText);
        }, 500);

        return () => {
            clearTimeout(searchTimerRef.current);
        };

    }, [query]);


    // =====================================
    // LOAD TRENDING SONGS
    // =====================================

    useEffect(() => {

        const loadTrendingSongs = async () => {

            try {

                setTrendingLoading(true);

                const results = await fetchSongs(
                    "trending Indian songs 2026"
                );

                setTrendingSongs(results.slice(0, 6));

            } catch (err) {

                console.error("Trending songs error:", err);

            } finally {

                setTrendingLoading(false);

            }

        };

        loadTrendingSongs();

    }, []);


    // =====================================
    // PLAY SONG
    // =====================================

    const playSong = (song) => {

        setCurrentSong(song);

        setRecentlyPlayed(previous => {

            const updated = [
                song,
                ...previous.filter(
                    item => item.videoId !== song.videoId
                )
            ].slice(0, 10);

            localStorage.setItem(
                "bolosaathi_recent_songs",
                JSON.stringify(updated)
            );

            return updated;

        });

    };


    // =====================================
    // NEXT SONG
    // =====================================

    const playNextSong = () => {

        if (!currentSong) return;

        const playlist = songs.length > 0
            ? songs
            : trendingSongs;

        if (playlist.length === 0) return;

        const currentIndex = playlist.findIndex(
            song => song.videoId === currentSong.videoId
        );

        const nextIndex = (currentIndex + 1) % playlist.length;

        playSong(playlist[nextIndex]);

    };


    // =====================================
    // VOICE SEARCH
    // =====================================

    const startVoiceSearch = () => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            setError(
                "Voice search is not supported in this browser. Please use Google Chrome."
            );

            return;

        }

        setError("");

        const recognition = new SpeechRecognition();

        recognitionRef.current = recognition;

        recognition.lang = "en-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onresult = (event) => {

            const spokenText =
                event.results[0][0].transcript;

            setQuery(spokenText);

            searchSongs(spokenText);

        };

        recognition.onerror = (event) => {

            console.error("Voice search error:", event.error);

            if (event.error === "not-allowed") {

                setError(
                    "Microphone permission denied. Please allow microphone access."
                );

            } else if (event.error !== "no-speech") {

                setError("Voice search failed. Please try again.");

            }

        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.start();

    };


    // =====================================
    // STOP VOICE SEARCH
    // =====================================

    const stopVoiceSearch = () => {

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        setListening(false);

    };


    // =====================================
    // POPULAR PLAYLISTS
    // =====================================

    const playlists = [
        {
            title: "Telugu Hits",
            subtitle: "Popular Telugu songs",
            emoji: "🎶",
            query: "Telugu hit songs"
        },
        {
            title: "Hindi Hits",
            subtitle: "Bollywood favourites",
            emoji: "🎧",
            query: "Hindi Bollywood hit songs"
        },
        {
            title: "Romantic",
            subtitle: "Love and melody",
            emoji: "❤️",
            query: "Romantic love songs"
        },
        {
            title: "Devotional",
            subtitle: "Peaceful devotional music",
            emoji: "🙏",
            query: "Indian devotional songs"
        },
        {
            title: "Melody Hits",
            subtitle: "Beautiful melodies",
            emoji: "🎼",
            query: "Best Indian melody songs"
        }
    ];


    // =====================================
    // PLAYLIST SEARCH
    // =====================================

    const openPlaylist = (playlist) => {

        setQuery(playlist.query);

        searchSongs(playlist.query);

    };


    // =====================================
    // SONG CARD
    // =====================================

    const renderSongCard = (song, index) => (

        <div
            className={`music-song-card ${
                currentSong?.videoId === song.videoId
                    ? "active-song"
                    : ""
            }`}
            key={song.videoId}
        >

            <div className="music-thumbnail-wrapper">

                <img
                    src={song.thumbnail}
                    alt={song.title}
                />

                <button
                    className="music-thumbnail-play"
                    onClick={() => playSong(song)}
                    title="Play song"
                >

                    <Play size={21} fill="white" />

                </button>

            </div>

            <div className="music-song-details">

                <h4>{song.title}</h4>

                <p>{song.artist}</p>

                <span>Music • Result {index + 1}</span>

            </div>

            <button
                className="music-play-button"
                onClick={() => playSong(song)}
                title="Play song"
            >

                <Play size={19} />

            </button>

        </div>

    );


    // =====================================
    // MAIN UI
    // =====================================

    return (

        <div className="music-player-page">

            {/* HEADER */}

            <div className="music-player-header">

                <div>

                    <h2>
                        <Music size={27} />
                        BoloSaathi Music
                    </h2>

                    <p>
                        Discover music. Explore favourites. Enjoy every moment.
                    </p>

                </div>

                <button
                    className="music-close-button"
                    onClick={onClose}
                >
                    <X size={22} />
                </button>

            </div>


            {/* SEARCH BAR */}

            <div className="music-search-box">

                <input
                    type="text"
                    placeholder="Search songs, singers, albums..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {

                        if (e.key === "Enter") {
                            searchSongs();
                        }

                    }}
                />

                <button
                    className="music-search-button"
                    onClick={() => searchSongs()}
                    disabled={loading}
                    title="Search songs"
                >

                    <Search size={21} />

                </button>

                <button
                    className={`music-voice-button ${
                        listening ? "voice-listening" : ""
                    }`}
                    onClick={
                        listening
                            ? stopVoiceSearch
                            : startVoiceSearch
                    }
                    title="Voice search"
                    disabled={loading}
                >

                    {listening ? (
                        <MicOff size={21} />
                    ) : (
                        <Mic size={21} />
                    )}

                </button>

            </div>


            {/* VOICE STATUS */}

            {listening && (

                <div className="music-listening-status">

                    <span className="music-listening-dot"></span>

                    Listening... Speak a song name.

                </div>

            )}


            {/* ERROR */}

            {error && (

                <p className="music-error">
                    {error}
                </p>

            )}


            {/* LOADING */}

            {loading && (

                <div className="music-loading">

                    <div className="music-spinner"></div>

                    Searching songs...

                </div>

            )}


            {/* NOW PLAYING */}

            {currentSong && (

                <div className="music-now-playing">

                    <h3>
                        <Headphones size={21} />
                        Now Playing
                    </h3>

                    <div className="music-video-container">

                        <iframe
                            key={currentSong.videoId}
                            src={`https://www.youtube.com/embed/${currentSong.videoId}?autoplay=1&rel=0`}
                            title={currentSong.title}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />

                    </div>

                    <h3>{currentSong.title}</h3>

                    <p>{currentSong.artist}</p>

                    <div className="music-controls">

                        <button onClick={playNextSong}>

                            <SkipForward size={20} />

                            Next Song

                        </button>

                        <button onClick={() => setCurrentSong(null)}>

                            <Pause size={20} />

                            Stop

                        </button>

                    </div>

                </div>

            )}


            {/* SEARCH RESULTS */}

            {songs.length > 0 && (

                <div className="music-results-section">

                    <div className="music-results-heading">

                        <h3>Search Results</h3>

                        <span>{songs.length} results</span>

                    </div>

                    <div className="music-results">

                        {songs.map((song, index) =>
                            renderSongCard(song, index)
                        )}

                    </div>

                </div>

            )}


            {/* DISCOVERY CONTENT */}

            {songs.length === 0 &&
                !loading &&
                query.trim().length < 2 && (

                <div className="music-discovery">


                    {/* WELCOME BANNER */}

                    <div className="music-welcome-banner">

                        <div className="music-welcome-content">

                            <span className="music-welcome-label">
                                <Sparkles size={15} />
                                YOUR MUSIC SPACE
                            </span>

                            <h2>
                                Feel the Music.
                                <br />
                                <span>Live the Moment.</span>
                            </h2>

                            <p>
                                Explore your favourite songs and discover
                                something new every day.
                            </p>

                        </div>

                        <div className="music-welcome-icon">
                            🎵
                        </div>

                    </div>


                    {/* POPULAR PLAYLISTS */}

                    <section className="music-playlist-section">

                        <div className="music-section-heading">

                            <div>

                                <h3>
                                    <Heart size={20} />
                                    Explore Playlists
                                </h3>

                                <p>Choose your favourite music category.</p>

                            </div>

                        </div>


                        <div className="music-playlist-grid">

                            {playlists.map((playlist) => (

                                <button
                                    className="music-playlist-card"
                                    key={playlist.title}
                                    onClick={() => openPlaylist(playlist)}
                                >

                                    <span className="music-playlist-emoji">
                                        {playlist.emoji}
                                    </span>

                                    <span className="music-playlist-title">
                                        {playlist.title}
                                    </span>

                                    <span className="music-playlist-subtitle">
                                        {playlist.subtitle}
                                    </span>

                                    <span className="music-playlist-arrow">
                                        <Play size={17} fill="currentColor" />
                                    </span>

                                </button>

                            ))}

                        </div>

                    </section>


                    {/* TRENDING SONGS */}

                    <section className="music-discovery-section">

                        <div className="music-section-heading">

                            <div>

                                <h3>
                                    <TrendingUp size={21} />
                                    Trending Songs
                                </h3>

                                <p>Discover popular music from YouTube.</p>

                            </div>

                            <span className="music-trending-badge">
                                TRENDING
                            </span>

                        </div>


                        {trendingLoading ? (

                            <div className="music-loading">

                                <div className="music-spinner"></div>

                                Discovering trending songs...

                            </div>

                        ) : trendingSongs.length > 0 ? (

                            <div className="music-results">

                                {trendingSongs.map((song, index) =>
                                    renderSongCard(song, index)
                                )}

                            </div>

                        ) : (

                            <p className="music-discovery-empty">
                                Trending songs are temporarily unavailable.
                                Use the search bar to discover music.
                            </p>

                        )}

                    </section>


                    {/* RECENTLY PLAYED */}

                    {recentlyPlayed.length > 0 && (

                        <section className="music-discovery-section">

                            <div className="music-section-heading">

                                <div>

                                    <h3>
                                        <Clock size={21} />
                                        Recently Played
                                    </h3>

                                    <p>Continue listening to your favourites.</p>

                                </div>

                            </div>

                            <div className="music-results">

                                {recentlyPlayed.map((song, index) =>
                                    renderSongCard(song, index)
                                )}

                            </div>

                        </section>

                    )}

                </div>

            )}

        </div>

    );

}

export default MusicPlayer;