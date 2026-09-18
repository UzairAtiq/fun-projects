import SwiftUI

struct SettingsView: View {
    @Bindable var session: SessionManager
    @Bindable var appState: AppState
    let scheduler: BackgroundScheduler
    let notifications: NotificationManager
    @Environment(\.dismiss) var dismiss
    
    private let intervals: [(String, TimeInterval)] = [
        ("15 minutes", 900),
        ("30 minutes", 1800),
        ("1 hour", 3600),
        ("2 hours", 7200),
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Settings").font(.headline).fontWeight(.bold)
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(.tertiary).font(.title3)
                }.buttonStyle(.plain)
            }
            .padding(16)
            
            Divider().opacity(0.3)
            
            Form {
                Section("Account") {
                    LabeledContent("Enrollment", value: session.enrollment)
                    LabeledContent("Campus", value: "Islamabad E-8 Campus")
                }
                
                Section("Refresh Interval") {
                    Picker("Auto-refresh every", selection: Binding(
                        get: { session.refreshInterval },
                        set: { newVal in
                            session.updateRefreshInterval(newVal)
                            scheduler.startScheduler(interval: newVal, appState: appState, session: session, notifications: notifications)
                        }
                    )) {
                        ForEach(intervals, id: \.1) { name, val in
                            Text(name).tag(val)
                        }
                    }
                }
                
                Section("Notifications") {
                    Toggle("Deadline reminders (12h before)", isOn: .constant(notifications.isAuthorized))
                        .disabled(true)
                    if !notifications.isAuthorized {
                        Button("Enable Notifications") {
                            Task { await notifications.requestPermission() }
                        }
                    }
                }
                
                Section {
                    Button(role: .destructive) {
                        session.logout()
                        appState.isLoggedIn = false
                        appState.assignments = []
                        scheduler.stopScheduler()
                        notifications.clearAllNotifications()
                    } label: {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text("Sign Out")
                        }
                        .foregroundStyle(.red)
                    }
                }
            }
            .formStyle(.grouped)
            .frame(width: 340, height: 320)
        }
    }
}
