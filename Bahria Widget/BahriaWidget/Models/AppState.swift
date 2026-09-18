import Foundation
import WidgetKit

// MARK: - App State (Observable)

@MainActor
@Observable
final class AppState {
    var assignments: [Assignment] = []
    var isLoading = false
    var lastUpdated: Date?
    var errorMessage: String?
    var isLoggedIn: Bool = false
    var showingSettings = false
    
    // Sorted by urgency (most urgent first)
    var sortedAssignments: [Assignment] {
        assignments.sorted { a, b in
            guard let da = a.deadline else { return false }
            guard let db = b.deadline else { return true }
            return da < db
        }
    }
    
    var pendingCount: Int { assignments.count }
    
    var urgentCount: Int {
        assignments.filter { $0.urgencyLevel == .critical || $0.urgencyLevel == .overdue }.count
    }
}

// MARK: - Background Scheduler

@MainActor
@Observable
final class BackgroundScheduler {
    private var timer: Timer?
    private let lmsService = LMSService()
    
    var isRefreshing = false
    
    func startScheduler(interval: TimeInterval, appState: AppState,
                        session: SessionManager, notifications: NotificationManager) {
        stopScheduler()
        
        // Initial fetch
        Task { await refresh(appState: appState, session: session, notifications: notifications) }
        
        // Schedule periodic refresh
        timer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            guard let self else { return }
            Task { @MainActor in
                await self.refresh(appState: appState, session: session, notifications: notifications)
            }
        }
        RunLoop.main.add(timer!, forMode: .common)
    }
    
    func stopScheduler() {
        timer?.invalidate()
        timer = nil
    }
    
    func refresh(appState: AppState, session: SessionManager,
                 notifications: NotificationManager) async {
        guard session.isLoggedIn, !isRefreshing else { return }
        
        isRefreshing = true
        appState.isLoading = true
        appState.errorMessage = nil
        
        do {
            let assignments = try await lmsService.fetchAssignments(
                enrollment: session.enrollment,
                password: session.password,
                pythonPath: session.pythonPath
            )
            
            appState.assignments = assignments
            appState.lastUpdated = Date()
            appState.errorMessage = nil
            
            // Save to shared storage for widget
            SharedDataManager.saveAssignments(assignments)
            SharedDataManager.clearError()
            
            // Schedule notifications
            await notifications.scheduleDeadlineReminders(for: assignments)
            
            // Reload widget timeline
            WidgetCenter.shared.reloadAllTimelines()
            
        } catch {
            appState.errorMessage = error.localizedDescription
            SharedDataManager.saveError(error.localizedDescription)
            
            // If auth error, mark as logged out
            if let lmsError = error as? LMSError,
               case .authenticationFailed = lmsError {
                session.isLoggedIn = false
                appState.isLoggedIn = false
            }
        }
        
        appState.isLoading = false
        isRefreshing = false
    }
}
