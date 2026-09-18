import SwiftUI
import WidgetKit

// MARK: - Small Widget

struct SmallWidgetView: View {
    let entry: AssignmentEntry
    
    var body: some View {
        VStack(spacing: 6) {
            HStack {
                Image(systemName: "graduationcap.fill")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.8))
                Spacer()
            }
            
            Spacer()
            
            Text("\(entry.assignments.count)")
                .font(.system(size: 44, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            
            Text(entry.assignments.count == 1 ? "Assignment" : "Assignments")
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.7))
            
            Text("Due")
                .font(.caption2)
                .fontWeight(.semibold)
                .foregroundStyle(.white.opacity(0.5))
            
            Spacer()
            
            if let nearest = nearestDeadline {
                HStack(spacing: 3) {
                    Image(systemName: "clock").font(.system(size: 8))
                    Text(nearest)
                        .font(.system(size: 9, weight: .medium, design: .monospaced))
                }
                .foregroundStyle(.white.opacity(0.6))
            }
        }
        .padding(12)
        .containerBackground(for: .widget) {
            LinearGradient.widgetBackground
        }
    }
    
    private var nearestDeadline: String? {
        entry.assignments
            .compactMap(\.deadline)
            .filter { $0 > Date() }
            .min()
            .map { date in
                let remaining = date.timeIntervalSinceNow
                let h = Int(remaining) / 3600
                let m = (Int(remaining) % 3600) / 60
                return h > 24 ? "\(h/24)d \(h%24)h" : "\(h)h \(m)m"
            }
    }
}
