import Foundation
import UserNotifications

// MARK: - Notification Manager
// Schedules native macOS notifications 12 hours before assignment deadlines

@MainActor
@Observable
final class NotificationManager {
    var isAuthorized = false
    private var scheduledIDs: Set<String> = []
    
    init() {
        Task { await checkAuthorization() }
    }
    
    // MARK: - Authorization
    
    func requestPermission() async {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound, .badge])
            isAuthorized = granted
        } catch {
            print("[Notifications] Permission request failed: \(error)")
        }
    }
    
    func checkAuthorization() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        isAuthorized = settings.authorizationStatus == .authorized
    }
    
    // MARK: - Schedule Notifications
    
    func scheduleDeadlineReminders(for assignments: [Assignment]) async {
        guard isAuthorized else { return }
        
        // Remove all existing assignment notifications
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()
        scheduledIDs.removeAll()
        
        for assignment in assignments {
            guard let deadline = assignment.deadline else { continue }
            
            // Schedule 12 hours before deadline
            let reminderDate = deadline.addingTimeInterval(-AppConstants.deadlineWarningHours * 3600)
            
            // Only schedule if the reminder is in the future
            guard reminderDate > Date() else { continue }
            
            let content = UNMutableNotificationContent()
            content.title = "⏰ Assignment Due Soon"
            content.subtitle = assignment.course
            content.body = "\"\(assignment.title)\" is due in \(Int(AppConstants.deadlineWarningHours)) hours — \(assignment.deadlineFormatted)"
            content.sound = .default
            content.categoryIdentifier = AppConstants.notificationCategoryID
            
            // Add assignment link as userInfo
            if !assignment.link.isEmpty {
                content.userInfo = ["assignmentLink": assignment.link]
            }
            
            let triggerDate = Calendar.current.dateComponents(
                [.year, .month, .day, .hour, .minute, .second],
                from: reminderDate
            )
            let trigger = UNCalendarNotificationTrigger(dateMatching: triggerDate, repeats: false)
            
            let requestID = "assignment-\(assignment.id.hashValue)"
            let request = UNNotificationRequest(identifier: requestID, content: content, trigger: trigger)
            
            do {
                try await center.add(request)
                scheduledIDs.insert(requestID)
            } catch {
                print("[Notifications] Failed to schedule: \(error)")
            }
        }
        
        print("[Notifications] Scheduled \(scheduledIDs.count) reminder(s)")
    }
    
    func clearAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
        scheduledIDs.removeAll()
    }
}
