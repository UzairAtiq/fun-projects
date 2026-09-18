import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const PlaylistCard = ({ playlist, onTrackSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
        {playlist.name}
      </h3>
      
      <div className="space-y-2">
        {playlist.tracks.map((track, index) => (
          <motion.button
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            onClick={() => onTrackSelect(track)}
            className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group"
          >
            {/* Track Number */}
            <span className="text-gray-400 w-6 text-center group-hover:text-red-500 transition-colors">
              {index + 1}
            </span>

            {/* Album Art */}
            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={track.albumArt || '/placeholder-album.jpg'}
                alt={track.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium truncate group-hover:text-red-400 transition-colors">
                {track.name}
              </p>
              <p className="text-sm text-gray-400 truncate">{track.artist}</p>
            </div>

            {/* Duration */}
            <span className="text-sm text-gray-400">
              {track.duration || '3:45'}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

PlaylistCard.propTypes = {
  playlist: PropTypes.shape({
    name: PropTypes.string.isRequired,
    tracks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        artist: PropTypes.string.isRequired,
        albumArt: PropTypes.string,
        duration: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  onTrackSelect: PropTypes.func.isRequired,
};

export default PlaylistCard;
