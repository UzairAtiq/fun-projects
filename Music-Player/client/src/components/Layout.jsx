import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 glass-effect m-4 p-6 flex flex-col"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            MoodBeats
          </h1>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
              >
                <span>🏠</span>
                <span>Home</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
              >
                <span>🎭</span>
                <span>Moods</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
              >
                <span>📚</span>
                <span>Library</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-lg hover:from-red-700 hover:to-red-900 transition-all font-medium">
            Connect Spotify
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
