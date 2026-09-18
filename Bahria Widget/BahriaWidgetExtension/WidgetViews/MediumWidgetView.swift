import SwiftUI
import WidgetKit

struct MediumWidgetView: View {
    let entry: AssignmentEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Image(systemName: "graduationcap.fill")
                    .font(.caption2).foregroundStyle(.white.opacity(0.8))
                Text("Bahria LMS")
                    .font(.caption2).fontWeight(.semibold).foregroundStyle(.white.opacity(0.8))
                Spacer()
                if let lastUpdated = entry.lastUpdated {
                    Text(lastUpdated, style: .relative)
                        .font(.system(size: 8)).foregroundStyle(.white.opacity(0.4))
                }
            }
            
            if entry.assignments.isEmpty {
                Spacer()
                HStack {
                    Spacer()
                    VStack(spacing: 4) {
                        Image(systemName: "checkmark.seal.fill").font(.title3).foregroundStyle(.green.opacity(0.8))
                        Text("All caught up!").font(.caption).foregroundStyle(.white.opacity(0.7))
                    }
                    Spacer()
                }
                Spacer()
            } else {
                ForEach(entry.assignments.sorted(by: { ($0.deadline ?? .distantFuture) < ($1.deadline ?? .distantFuture) }).prefix(2), id: \.id) { assignment in
                    widgetAssignmentRow(assignment)
                }
                
                if entry.assignments.count > 2 {
                    Text("+\(entry.assignments.count - 2) more")
                        .font(.system(size: 9)).foregroundStyle(.white.opacity(0.4))
                }
            }
        }
        .padding(12)
        .containerBackground(for: .widget) {
            LinearGradient.widgetBackground
        }
    }
    
    private func widgetAssignmentRow(_ assignment: Assignment) -> some View {
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(assignment.urgencyLevel.color)
                .frame(width: 3, height: 28)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(assignment.title)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.white).lineLimit(1)
                Text(assignment.course)
                    .font(.system(size: 9))
                    .foregroundStyle(.white.opacity(0.5)).lineLimit(1)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                Text(assignment.remainingTimeFormatted)
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .foregroundStyle(assignment.urgencyLevel.color)
                if let d = assignment.deadline {
                    Text(d, style: .date)
                        .font(.system(size: 8))
                        .foregroundStyle(.white.opacity(0.4))
                }
            }
        }
        .padding(.vertical, 4).padding(.horizontal, 8)
        .background(RoundedRectangle(cornerRadius: 8).fill(.white.opacity(0.06)))
    }
}
