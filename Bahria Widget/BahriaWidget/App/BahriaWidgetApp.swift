import SwiftUI
import WidgetKit

@main
struct BahriaWidgetApp: App {
    @State private var appState = AppState()
    @State private var session = SessionManager()
    @State private var scheduler = BackgroundScheduler()
    @State private var notifications = NotificationManager()
    
    init() {
        print("🚀 Bahria Widget App Started")
    }
    
    var body: some Scene {
        WindowGroup {
            contentView
                .frame(minWidth: 400, minHeight: 500)
                .onAppear {
                    print("🪟 Main Window appeared")
                }
        }
        
        MenuBarExtra {
            contentView
                .frame(width: 360)
                .sheet(isPresented: $appState.showingSettings) {
                    SettingsView(
                        session: session,
                        appState: appState,
                        scheduler: scheduler,
                        notifications: notifications
                    )
                }
        } label: {
            Label {
                Text(appState.pendingCount > 0 ? "\(appState.pendingCount)" : "Bahria")
            } icon: {
                Image(systemName: "graduationcap.fill")
            }
        }
        .menuBarExtraStyle(.window)
    }
    
    // MARK: - Content
    
    @ViewBuilder
    private var contentView: some View {
        VStack(spacing: 0) {
            if session.isLoggedIn {
                AssignmentListView(
                    appState: appState,
                    scheduler: scheduler,
                    session: session,
                    notifications: notifications
                )
                .onAppear { 
                    print("📱 AssignmentListView appeared")
                    startBackgroundRefresh() 
                }
            } else {
                LoginView(
                    session: session,
                    appState: appState,
                    scheduler: scheduler,
                    notifications: notifications
                )
                .onAppear {
                    print("🔑 LoginView appeared")
                }
            }
        }
    }
    
    private func startBackgroundRefresh() {
        print("🔄 startBackgroundRefresh called")
        guard session.isLoggedIn else { 
            print("🛑 Skipping refresh: not logged in")
            return 
        }
        
        // Load cached assignments immediately
        let cache = SharedDataManager.loadAssignments()
        if !cache.assignments.isEmpty {
            print("📦 Loaded \(cache.assignments.count) assignments from cache")
            appState.assignments = cache.assignments
            appState.lastUpdated = cache.lastUpdated
        }
        appState.isLoggedIn = true
        
        // Start periodic refresh
        print("⏲️ Starting scheduler")
        scheduler.startScheduler(
            interval: session.refreshInterval,
            appState: appState,
            session: session,
            notifications: notifications
        )
    }
}
