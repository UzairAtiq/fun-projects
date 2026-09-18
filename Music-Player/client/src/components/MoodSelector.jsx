import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const moods = [
  { id: 'chill', name: 'Chill', emoji: '😌', color: 'from-blue-500 to-purple-500', description: 'Relax and unwind' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡', color: 'from-yellow-500 to-orange-500', description: 'Get pumped up' },
  { id: 'sad', name: 'Sad', emoji: '😢', color: 'from-gray-500 to-blue-600', description: 'Let it out' },
  { id: 'focus', name: 'Focus', emoji: '🎯', color: 'from-green-500 to-teal-500', description: 'Stay concentrated' },
  { id: 'party', name: 'Party', emoji: '🎉', color: 'from-pink-500 to-red-500', description: 'Let\'s celebrate' },
  { id: 'romantic', name: 'Romantic', emoji: '💕', color: 'from-red-400 to-pink-400', description: 'Feel the love' },
];

const MoodSelector = ({ onSelect, selectedMood }) => {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
        How are you feeling?
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mood.id)}
            className={`glass-card p-6 text-left relative overflow-hidden group ${
              selectedMood === mood.id ? 'ring-2 ring-red-500' : ''
            }`}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-4xl mb-3">{mood.emoji}</div>
              <h3 className="text-xl font-bold mb-1">{mood.name}</h3>
              <p className="text-sm text-gray-400">{mood.description}</p>
            </div>

            {/* Selected Indicator */}
            {selectedMood === mood.id && (
              <motion.div
                layoutId="selected"
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span className="text-xs">✓</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

MoodSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  selectedMood: PropTypes.string,
};

export default MoodSelector;
