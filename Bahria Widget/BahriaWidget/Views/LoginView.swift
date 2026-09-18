import SwiftUI

// MARK: - Login View

struct LoginView: View {
    @Bindable var session: SessionManager
    @Bindable var appState: AppState
    let scheduler: BackgroundScheduler
    let notifications: NotificationManager
    
    @State private var enrollment = ""
    @State private var password = ""
    @State private var isAuthenticating = false
    @State private var errorMessage: String?
    @State private var showPassword = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            headerSection
            
            Divider().opacity(0.3)
            
            // Form
            VStack(spacing: 16) {
                campusField
                enrollmentField
                passwordField
                
                if let error = errorMessage {
                    errorBanner(error)
                }
                
                signInButton
            }
            .padding(24)
        }
        .frame(width: 340)
        .background(.ultraThinMaterial)
    }
    
    // MARK: - Subviews
    
    private var headerSection: some View {
        VStack(spacing: 8) {
            Image(systemName: "graduationcap.fill")
                .font(.system(size: 36))
                .foregroundStyle(.linearGradient(
                    colors: [.accentGradientStart, .accentGradientEnd],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))
            
            Text("Bahria LMS")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Sign in to view your assignments")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 20)
    }
    
    private var campusField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("CAMPUS")
                .font(.caption2)
                .fontWeight(.semibold)
                .foregroundStyle(.tertiary)
            
            HStack {
                Image(systemName: "building.2.fill")
                    .foregroundStyle(.secondary)
                    .frame(width: 20)
                Text("Islamabad E-8 Campus")
                    .foregroundStyle(.secondary)
                Spacer()
                Image(systemName: "lock.fill")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(10)
            .background(.quaternary.opacity(0.5))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
    
    private var enrollmentField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("ENROLLMENT NUMBER")
                .font(.caption2)
                .fontWeight(.semibold)
                .foregroundStyle(.tertiary)
            
            HStack(spacing: 8) {
                Image(systemName: "person.fill")
                    .foregroundStyle(.secondary)
                    .frame(width: 20)
                TextField("e.g. 01-131232-001", text: $enrollment)
                    .textFieldStyle(.plain)
                    .font(.body)
            }
            .padding(10)
            .background(.quaternary.opacity(0.3))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(.quaternary, lineWidth: 1)
            )
        }
    }
    
    private var passwordField: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("PASSWORD")
                .font(.caption2)
                .fontWeight(.semibold)
                .foregroundStyle(.tertiary)
            
            HStack(spacing: 8) {
                Image(systemName: "lock.fill")
                    .foregroundStyle(.secondary)
                    .frame(width: 20)
                
                if showPassword {
                    TextField("Password", text: $password)
                        .textFieldStyle(.plain)
                } else {
                    SecureField("Password", text: $password)
                        .textFieldStyle(.plain)
                }
                
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                        .foregroundStyle(.tertiary)
                        .font(.caption)
                }
                .buttonStyle(.plain)
            }
            .padding(10)
            .background(.quaternary.opacity(0.3))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(.quaternary, lineWidth: 1)
            )
        }
    }
    
    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.red)
            Text(message)
                .font(.caption)
                .foregroundStyle(.red)
            Spacer()
        }
        .padding(10)
        .background(.red.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    private var signInButton: some View {
        Button {
            Task { await signIn() }
        } label: {
            HStack {
                if isAuthenticating {
                    ProgressView()
                        .controlSize(.small)
                        .tint(.white)
                } else {
                    Text("Sign In")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(
                canSignIn
                    ? AnyShapeStyle(LinearGradient.appAccent)
                    : AnyShapeStyle(Color.gray.opacity(0.3))
            )
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .buttonStyle(.plain)
        .disabled(!canSignIn)
    }
    
    // MARK: - Logic
    
    private var canSignIn: Bool {
        !enrollment.trimmingCharacters(in: .whitespaces).isEmpty &&
        !password.isEmpty &&
        !isAuthenticating
    }
    
    private func signIn() async {
        isAuthenticating = true
        errorMessage = nil
        
        let service = LMSService()
        do {
            let assignments = try await service.fetchAssignments(
                enrollment: enrollment.trimmingCharacters(in: .whitespaces),
                password: password
            )
            
            session.saveCredentials(enrollment: enrollment.trimmingCharacters(in: .whitespaces),
                                     password: password)
            appState.isLoggedIn = true
            appState.assignments = assignments
            appState.lastUpdated = Date()
            
            SharedDataManager.saveAssignments(assignments)
            
            // Request notification permission
            await notifications.requestPermission()
            await notifications.scheduleDeadlineReminders(for: assignments)
            
            // Start background refresh
            scheduler.startScheduler(
                interval: session.refreshInterval,
                appState: appState,
                session: session,
                notifications: notifications
            )
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isAuthenticating = false
    }
}
