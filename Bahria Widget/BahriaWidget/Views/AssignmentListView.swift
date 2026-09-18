import SwiftUI

struct AssignmentListView: View {
    @Bindable var appState: AppState
    let scheduler: BackgroundScheduler
    let session: SessionManager
    let notifications: NotificationManager
    
    @State private var refreshRotation: Double = 0
    
    var body: some View {
        VStack(spacing: 0) {
            headerBar
            Divider().opacity(0.3)
            
            ScrollView {
                VStack(spacing: 10) {
                    if let error = appState.errorMessage {
                        errorBanner(error)
                    }
                    if appState.isLoading && appState.assignments.isEmpty {
                        loadingView
                    } else if appState.assignments.isEmpty {
                        emptyStateView
                    } else {
                        assignmentsList
                    }
                }
                .padding(14)
            }
            .frame(maxHeight: 460)
            
            Divider().opacity(0.3)
            footerBar
        }
        .frame(width: 360)
        .background(.ultraThinMaterial)
    }
    
    private var headerBar: some View {
        HStack {
            HStack(spacing: 6) {
                Image(systemName: "graduationcap.fill")
                    .foregroundStyle(LinearGradient.appAccent)
                Text("Bahria LMS")
                    .font(.headline).fontWeight(.bold)
            }
            Spacer()
            Button { Task { await manualRefresh() } } label: {
                Image(systemName: "arrow.clockwise")
                    .font(.system(size: 13, weight: .semibold))
                    .rotationEffect(.degrees(refreshRotation))
                    .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain).disabled(appState.isLoading)
            
            if appState.pendingCount > 0 {
                Text("\(appState.pendingCount)")
                    .font(.caption2).fontWeight(.bold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 7).padding(.vertical, 2)
                    .background(Capsule().fill(appState.urgentCount > 0 ? Color.urgencyCritical : Color.accentGradientStart))
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
    }
    
    private var assignmentsList: some View {
        ForEach(Array(appState.sortedAssignments.enumerated()), id: \.element.id) { index, assignment in
            AssignmentCardView(assignment: assignment)
                .transition(.asymmetric(insertion: .move(edge: .top).combined(with: .opacity), removal: .opacity))
                .animation(.spring(response: 0.4, dampingFraction: 0.8).delay(Double(index) * 0.05), value: appState.assignments.count)
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: 10) { ForEach(0..<3, id: \.self) { _ in SkeletonCardView() } }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 12) {
            Spacer().frame(height: 30)
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 44))
                .foregroundStyle(.linearGradient(colors: [.urgencyNormal, .green], startPoint: .topLeading, endPoint: .bottomTrailing))
            Text("All Caught Up!").font(.title3).fontWeight(.semibold)
            Text("No pending assignments found.\nEnjoy your free time! 🎉")
                .font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.center)
            Spacer().frame(height: 30)
        }
        .frame(maxWidth: .infinity)
    }
    
    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.orange)
            VStack(alignment: .leading, spacing: 2) {
                Text("Something went wrong").font(.caption).fontWeight(.semibold)
                Text(message).font(.caption2).foregroundStyle(.secondary).lineLimit(2)
            }
            Spacer()
            Button("Retry") { Task { await manualRefresh() } }
                .font(.caption2).buttonStyle(.bordered).controlSize(.mini)
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 10).fill(.orange.opacity(0.08))
            .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.orange.opacity(0.2), lineWidth: 1)))
    }
    
    private var footerBar: some View {
        HStack {
            if let lastUpdated = appState.lastUpdated {
                HStack(spacing: 4) {
                    Image(systemName: "clock").font(.caption2)
                    Text("Updated \(lastUpdated, style: .relative) ago").font(.caption2)
                }.foregroundStyle(.tertiary)
            }
            Spacer()
            Button { appState.showingSettings = true } label: {
                Image(systemName: "gearshape").font(.caption).foregroundStyle(.secondary)
            }.buttonStyle(.plain)
            Button { NSApplication.shared.terminate(nil) } label: {
                Image(systemName: "power").font(.caption).foregroundStyle(.secondary)
            }.buttonStyle(.plain)
        }
        .padding(.horizontal, 16).padding(.vertical, 10)
    }
    
    private func manualRefresh() async {
        withAnimation(.linear(duration: 0.8)) { refreshRotation += 360 }
        await scheduler.refresh(appState: appState, session: session, notifications: notifications)
    }
}
