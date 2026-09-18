import Foundation

// MARK: - Shared Data Manager
// Bridges the main app and WidgetKit extension via shared file storage

enum SharedDataManager {
    
    // MARK: - Assignments
    
    static func saveAssignments(_ assignments: [Assignment], lastUpdated: Date = Date()) {
        let cache = AssignmentCache(assignments: assignments, lastUpdated: lastUpdated, error: nil)
        do {
            let data = try JSONEncoder().encode(cache)
            try ensureDirectory()
            try data.write(to: AppConstants.assignmentsCacheFile)
        } catch {
            print("[SharedData] Failed to save assignments: \(error)")
        }
        
        // Also save to UserDefaults for widget access (App Group)
        if let defaults = UserDefaults(suiteName: AppConstants.appGroupID) {
            defaults.set(try? JSONEncoder().encode(cache), forKey: AppConstants.assignmentsKey)
            defaults.set(lastUpdated.timeIntervalSince1970, forKey: AppConstants.lastUpdatedKey)
        }
    }
    
    static func loadAssignments() -> AssignmentCache {
        // Try App Group UserDefaults first (widget uses this)
        if let defaults = UserDefaults(suiteName: AppConstants.appGroupID),
           let data = defaults.data(forKey: AppConstants.assignmentsKey),
           let cache = try? JSONDecoder().decode(AssignmentCache.self, from: data) {
            return cache
        }
        
        // Fallback to file
        guard FileManager.default.fileExists(atPath: AppConstants.assignmentsCacheFile.path) else {
            return AssignmentCache(assignments: [], lastUpdated: nil, error: nil)
        }
        
        do {
            let data = try Data(contentsOf: AppConstants.assignmentsCacheFile)
            return try JSONDecoder().decode(AssignmentCache.self, from: data)
        } catch {
            print("[SharedData] Failed to load assignments: \(error)")
            return AssignmentCache(assignments: [], lastUpdated: nil, error: error.localizedDescription)
        }
    }
    
    static func saveError(_ message: String) {
        if let defaults = UserDefaults(suiteName: AppConstants.appGroupID) {
            defaults.set(message, forKey: AppConstants.errorKey)
        }
    }
    
    static func clearError() {
        if let defaults = UserDefaults(suiteName: AppConstants.appGroupID) {
            defaults.removeObject(forKey: AppConstants.errorKey)
        }
    }
    
    // MARK: - Helpers
    
    private static func ensureDirectory() throws {
        let dir = AppConstants.configDirectory
        if !FileManager.default.fileExists(atPath: dir.path) {
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        }
    }
}

// MARK: - Assignment Cache

struct AssignmentCache: Codable {
    let assignments: [Assignment]
    let lastUpdated: Date?
    let error: String?
}
