import SwiftUI
import AppKit

// MARK: - Assignment Card View

struct AssignmentCardView: View {
    let assignment: Assignment
    
    @State private var isHovered = false
    @State private var remainingText: String = ""
    
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        HStack(spacing: 0) {
            urgencyBar
            cardContent
        }
        .background(cardBackground)
        .overlay(cardBorderOverlay)
        .scaleEffect(isHovered ? 1.01 : 1.0)
        .animation(.easeOut(duration: 0.2), value: isHovered)
        .onHover { isHovered = $0 }
        .onAppear { remainingText = assignment.remainingTimeFormatted }
        .onReceive(timer) { _ in remainingText = assignment.remainingTimeFormatted }
    }
    
    // MARK: - Subviews
    
    private var urgencyBar: some View {
        RoundedRectangle(cornerRadius: 2)
            .fill(assignment.urgencyLevel.color)
            .frame(width: 4)
            .padding(.vertical, 4)
    }
    
    private var cardContent: some View {
        VStack(alignment: .leading, spacing: 8) {
            titleRow
            Divider().opacity(0.2)
            deadlineRow
            openButton
        }
        .padding(12)
    }
    
    private var titleRow: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 3) {
                Text(assignment.title)
                    .font(.system(.body, design: .default, weight: .semibold))
                    .lineLimit(2)
                
                HStack(spacing: 4) {
                    Image(systemName: "book.closed.fill").font(.caption2)
                    Text(assignment.course).font(.caption)
                }
                .foregroundStyle(.secondary)
            }
            Spacer()
            urgencyBadge
        }
    }
    
    private var deadlineRow: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Due").font(.caption2).foregroundStyle(.tertiary)
                Text(assignment.deadlineFormatted).font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("Remaining").font(.caption2).foregroundStyle(.tertiary)
                Text(remainingText)
                    .font(.system(.caption, design: .monospaced, weight: .semibold))
                    .foregroundStyle(assignment.urgencyLevel.color)
            }
        }
    }
    
    @ViewBuilder
    private var openButton: some View {
        if !assignment.link.isEmpty {
            HStack {
                Spacer()
                Button {
                    if let url = URL(string: assignment.link) {
                        NSWorkspace.shared.open(url)
                    }
                } label: {
                    openButtonLabel
                }
                .buttonStyle(.plain)
            }
        }
    }
    
    private var openButtonLabel: some View {
        HStack(spacing: 4) {
            Text("Open in LMS").font(.caption2).fontWeight(.medium)
            Image(systemName: "arrow.up.right").font(.caption2)
        }
        .foregroundStyle(Color.accentGradientStart)
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(Color.accentGradientStart.opacity(0.1))
        .clipShape(Capsule())
    }
    
    private var urgencyBadge: some View {
        HStack(spacing: 3) {
            Image(systemName: assignment.urgencyLevel.icon).font(.caption2)
            Text(assignment.urgencyLevel.label).font(.caption2).fontWeight(.medium)
        }
        .foregroundStyle(assignment.urgencyLevel.color)
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(assignment.urgencyLevel.color.opacity(0.12))
        .clipShape(Capsule())
    }
    
    private var cardBackground: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(.ultraThinMaterial)
            .shadow(color: .black.opacity(isHovered ? 0.15 : 0.05),
                    radius: isHovered ? 8 : 4, y: 2)
    }
    
    private var cardBorderOverlay: some View {
        let borderColor: Color = isHovered
            ? assignment.urgencyLevel.color.opacity(0.3)
            : Color.white.opacity(0.06)
        return RoundedRectangle(cornerRadius: 12)
            .strokeBorder(borderColor, lineWidth: 1)
    }
}

// MARK: - Loading Skeleton Card

struct SkeletonCardView: View {
    @State private var shimmerOffset: CGFloat = -200
    
    var body: some View {
        skeletonContent
            .padding(16)
            .background(RoundedRectangle(cornerRadius: 12).fill(.ultraThinMaterial))
            .overlay(shimmerOverlay)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .onAppear { shimmerOffset = 400 }
    }
    
    private var skeletonContent: some View {
        VStack(alignment: .leading, spacing: 10) {
            RoundedRectangle(cornerRadius: 4).fill(.quaternary)
                .frame(height: 14).frame(maxWidth: 200)
            RoundedRectangle(cornerRadius: 4).fill(.quaternary)
                .frame(height: 10).frame(maxWidth: 150)
            Divider().opacity(0.1)
            HStack {
                RoundedRectangle(cornerRadius: 4).fill(.quaternary)
                    .frame(width: 100, height: 10)
                Spacer()
                RoundedRectangle(cornerRadius: 4).fill(.quaternary)
                    .frame(width: 80, height: 10)
            }
        }
    }
    
    private var shimmerOverlay: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(LinearGradient(
                colors: [.clear, .white.opacity(0.05), .clear],
                startPoint: .leading, endPoint: .trailing
            ))
            .offset(x: shimmerOffset)
            .animation(.linear(duration: 1.5).repeatForever(autoreverses: false),
                       value: shimmerOffset)
    }
}
