import SwiftUI
import WidgetKit

struct LargeWidgetView: View {
    let entry: AssignmentEntry
    
    private var sorted: [Assignment] {
        entry.assignments.sorted { ($0.deadline ?? .distantFuture) < ($1.deadline ?? .distantFuture) }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Image(systemName: "graduationcap.fill")
                    .font(.caption).foregroundStyle(.white.opacity(0.8))
                Text("Bahria LMS")
                    .font(.caption).fontWeight(.bold).foregroundStyle(.white.opacity(0.9))
                Spacer()
                Text("\(entry.assignments.count) pending")
                    .font(.caption2).foregroundStyle(.white.opacity(0.5))
            }
            
            Divider().overlay(Color.white.opacity(0.1))
            
            if entry.assignments.isEmpty {
                Spacer()
                HStack {
                    Spacer()
                    VStack(spacing: 6) {
                        Image(systemName: "checkmark.seal.fill").font(.largeTitle).foregroundStyle(.green.opacity(0.7))
                        Text("All Caught Up!").font(.callout).fontWeight(.semibold).foregroundStyle(.white.opacity(0.8))
                        Text("No pending assignments").font(.caption2).foregroundStyle(.white.opacity(0.4))
                    }
                    Spacer()
                }
                Spacer()
            } else {
                ForEach(Array(sorted.prefix(5).enumerated()), id: \.element.id) { _, assignment in
                    largeRow(assignment)
                }
                
                if entry.assignments.count > 5 {
                    HStack {
                        Spacer()
                        Text("+\(entry.assignments.count - 5) more assignments")
                            .font(.system(size: 9)).foregroundStyle(.white.opacity(0.4))
                        Spacer()
                    }
                }
                
                Spacer(minLength: 0)
                
                // Footer
                if let lastUpdated = entry.lastUpdated {
                    HStack {
                        Spacer()
                        HStack(spacing: 3) {
                            Image(systemName: "clock").font(.system(size: 8))
                            Text("Updated \(lastUpdated, style: .relative) ago").font(.system(size: 8))
                        }
                        .foregroundStyle(.white.opacity(0.3))
                        Spacer()
                    }
                }
            }
        }
        .padding(14)
        .containerBackground(for: .widget) {
            LinearGradient.widgetBackground
        }
    }
    
    private func largeRow(_ assignment: Assignment) -> some View {
        HStack(spacing: 8) {
            Circle()
                .fill(assignment.urgencyLevel.color)
                .frame(width: 6, height: 6)
            
            VStack(alignment: .leading, spacing: 1) {
                Text(assignment.title)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.white).lineLimit(1)
                HStack(spacing: 4) {
                    Text(assignment.course).lineLimit(1)
                    if let d = assignment.deadline {
                        Text("•")
                        Text(d, style: .date)
                    }
                }
                .font(.system(size: 9)).foregroundStyle(.white.opacity(0.45))
            }
            
            Spacer()
            
            Text(assignment.remainingTimeFormatted)
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundStyle(assignment.urgencyLevel.color)
        }
        .padding(.vertical, 5).padding(.horizontal, 8)
        .background(RoundedRectangle(cornerRadius: 7).fill(.white.opacity(0.05)))
    }
}
