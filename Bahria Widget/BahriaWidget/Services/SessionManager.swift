import Foundation

// MARK: - Session Manager
// Handles credential storage and configuration (simple JSON file for personal use)

@MainActor
@Observable
final class SessionManager {
    var enrollment: String = ""
    var password: String = ""
    var refreshInterval: TimeInterval = AppConstants.defaultRefreshInterval
    var isLoggedIn: Bool = false
    var pythonPath: String = ""
    
    private var config: AppConfig?
    
    init() {
        loadConfig()
    }
    
    // MARK: - Config File Operations
    
    func saveCredentials(enrollment: String, password: String) {
        self.enrollment = enrollment
        self.password = password
        self.isLoggedIn = true
        saveConfig()
    }
    
    func logout() {
        enrollment = ""
        password = ""
        isLoggedIn = false
        
        // Remove config file
        try? FileManager.default.removeItem(at: AppConstants.configFile)
        
        // Clear cached data
        try? FileManager.default.removeItem(at: AppConstants.assignmentsCacheFile)
        SharedDataManager.saveAssignments([], lastUpdated: Date())
    }
    
    func updateRefreshInterval(_ interval: TimeInterval) {
        refreshInterval = interval
        saveConfig()
    }
    
    // MARK: - Private
    
    private func loadConfig() {
        guard FileManager.default.fileExists(atPath: AppConstants.configFile.path) else {
            detectPythonPath()
            return
        }
        
        do {
            let data = try Data(contentsOf: AppConstants.configFile)
            let config = try JSONDecoder().decode(AppConfig.self, from: data)
            self.config = config
            self.enrollment = config.enrollment
            self.password = config.password
            self.refreshInterval = config.refreshInterval ?? AppConstants.defaultRefreshInterval
            self.pythonPath = config.pythonPath ?? ""
            self.isLoggedIn = !config.enrollment.isEmpty && !config.password.isEmpty
        } catch {
            print("[SessionManager] Failed to load config: \(error)")
        }
        
        if pythonPath.isEmpty {
            detectPythonPath()
        }
    }
    
    private func saveConfig() {
        let config = AppConfig(
            enrollment: enrollment,
            password: password,
            campus: "Islamabad E-8 Campus",
            refreshInterval: refreshInterval,
            pythonPath: pythonPath
        )
        
        do {
            let dir = AppConstants.configDirectory
            if !FileManager.default.fileExists(atPath: dir.path) {
                try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
            }
            let data = try JSONEncoder().encode(config)
            try data.write(to: AppConstants.configFile)
        } catch {
            print("[SessionManager] Failed to save config: \(error)")
        }
    }
    
    private func detectPythonPath() {
        for path in AppConstants.pythonPaths {
            if FileManager.default.fileExists(atPath: path) {
                pythonPath = path
                return
            }
        }
        pythonPath = "/usr/bin/env"
    }
}

// MARK: - Config Data

private struct AppConfig: Codable {
    let enrollment: String
    let password: String
    let campus: String
    let refreshInterval: TimeInterval?
    let pythonPath: String?
}
