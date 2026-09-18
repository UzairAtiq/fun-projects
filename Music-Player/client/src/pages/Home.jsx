import { useState } from 'react';
import Layout from '../components/Layout';
import MoodSelector from '../components/MoodSelector';
import PlaylistCard from '../components/PlaylistCard';
import MusicPlayer from '../components/MusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for development
const mockPlaylists = {
  chill: {
    name: 'Chill Vibes',
    tracks: [
      { id: '1', name: 'Weightless', artist: 'Marconi Union', albumArt: '', duration: '8:09' },
      { id: '2', name: 'Sunset Lover', artist: 'Petit Biscuit', albumArt: '', duration: '3:33' },
      { id: '3', name: 'Lost', artist: 'Frank Ocean', albumArt: '', duration: '3:58' },
    ],
  },
  energetic: {
    name: 'Energy Boost',
    tracks: [
      { id: '4', name: 'Eye of the Tiger', artist: 'Survivor', albumArt: '', duration: '4:04' },
      { id: '5', name: 'Thunder', artist: 'Imagine Dragons', albumArt: '', duration: '3:07' },
      { id: '6', name: 'Levels', artist: 'Avicii', albumArt: '', duration: '3:18' },
    ],
  },
  sad: {
    name: 'Sad Songs',
    tracks: [
      { id: '7', name: 'Someone Like You', artist: 'Adele', albumArt: '', duration: '4:45' },
      { id: '8', name: 'The Night We Met', artist: 'Lord Huron', albumArt: '', duration: '3:28' },
      { id: '9', name: 'Hurt', artist: 'Johnny Cash', albumArt: '', duration: '3:38' },
    ],
  },
};

const Home = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    console.log('Next track');
  };

  const handlePrevious = () => {
    console.log('Previous track');
  };

  return (
    <Layout>
      <div className="mb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-gray-400">Choose your mood and discover perfect tracks</p>
        </motion.div>

        {/* Mood Selector */}
        <MoodSelector onSelect={handleMoodSelect} selectedMood={selectedMood} />

        {/* Playlist */}
        <AnimatePresence mode="wait">
          {selectedMood && mockPlaylists[selectedMood] && (
            <motion.div
              key={selectedMood}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PlaylistCard
                playlist={mockPlaylists[selectedMood]}
                onTrackSelect={handleTrackSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedMood && (
          <div className="glass-card p-12 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-300">
              Select a mood to get started
            </h3>
            <p className="text-gray-400">
              Choose how you're feeling and we'll create the perfect playlist for you
            </p>
          </div>
        )}
      </div>

      {/* Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </Layout>
  );
};

export default Home;
