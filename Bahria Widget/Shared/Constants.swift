import Foundation

// MARK: - App Constants

enum AppConstants {
    static let appGroupID = "group.com.uzair.bahriawidget"
    static let assignmentsKey = "cached_assignments"
    static let lastUpdatedKey = "last_updated"
    static let errorKey = "last_error"
    
    static let configDirectory: URL = {
        let paths = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)
        let base = paths.first ?? FileManager.default.temporaryDirectory
        return base.appendingPathComponent("BahriaWidget")
    }()
    
    static let configFile: URL = configDirectory.appendingPathComponent("config.json")
    static let assignmentsCacheFile: URL = configDirectory.appendingPathComponent("assignments.json")
    
    static let defaultRefreshInterval: TimeInterval = 3600 // 1 hour
    static let scraperTimeout: TimeInterval = 120
    
    static let notificationCategoryID = "ASSIGNMENT_REMINDER"
    static let deadlineWarningHours: Double = 12
    
    // Python paths to search (Apple Silicon + Intel + Homebrew)
    static let pythonPaths = [
        "/opt/homebrew/bin/python3",
        "/usr/local/bin/python3",
        "/usr/bin/python3",
        "/usr/bin/env"
    ]
}
