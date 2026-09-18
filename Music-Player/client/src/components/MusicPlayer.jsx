import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const MusicPlayer = ({ currentTrack, isPlaying, onPlayPause, onNext, onPrevious }) => {
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 0.5;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTrack]);

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 glass-effect m-4 p-4">
        <div className="text-center text-gray-400">
          <p>No track selected</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 glass-effect m-4 p-4"
    >
      <div className="flex items-center gap-4">
        {/* Album Art */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
        >
          <img
            src={currentTrack.albumArt || '/placeholder-album.jpg'}
            alt={currentTrack.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold truncate">{currentTrack.name}</h4>
              <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-800"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevious}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">⏮</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPlayPause}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 transition-all"
          >
            <span className="text-2xl">{isPlaying ? '⏸' : '▶'}</span>
          </motion.button>

          <button
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">⏭</span>
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-32">
          <span className="text-lg">🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-red-600"
          />
        </div>
      </div>
    </motion.div>
  );
};

MusicPlayer.propTypes = {
  currentTrack: PropTypes.shape({
    name: PropTypes.string,
    artist: PropTypes.string,
    albumArt: PropTypes.string,
  }),
  isPlaying: PropTypes.bool,
  onPlayPause: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default MusicPlayer;
