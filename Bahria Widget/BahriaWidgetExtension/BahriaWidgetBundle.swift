import SwiftUI
import WidgetKit

struct BahriaAssignmentWidget: Widget {
    let kind = "BahriaAssignmentWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AssignmentTimelineProvider()) { entry in
            widgetView(for: entry)
        }
        .configurationDisplayName("Bahria Assignments")
        .description("Shows your pending LMS assignments with deadlines.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
    
    @ViewBuilder
    private func widgetView(for entry: AssignmentEntry) -> some View {
        // WidgetKit automatically selects the right family
        // We use _WidgetSizeReader via the environment
        SmallWidgetView(entry: entry)
    }
}

// Use separate widgets per size for cleaner code
struct BahriaAssignmentWidgetMedium: Widget {
    let kind = "BahriaAssignmentWidgetMedium"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AssignmentTimelineProvider()) { entry in
            MediumWidgetView(entry: entry)
        }
        .configurationDisplayName("Bahria Assignments")
        .description("Pending assignments with countdown timers.")
        .supportedFamilies([.systemMedium])
    }
}

struct BahriaAssignmentWidgetLarge: Widget {
    let kind = "BahriaAssignmentWidgetLarge"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AssignmentTimelineProvider()) { entry in
            LargeWidgetView(entry: entry)
        }
        .configurationDisplayName("Bahria Assignments (Full)")
        .description("Complete list of pending assignments.")
        .supportedFamilies([.systemLarge])
    }
}

@main
struct BahriaWidgetBundle: WidgetBundle {
    var body: some Widget {
        BahriaAssignmentWidget()
        BahriaAssignmentWidgetMedium()
        BahriaAssignmentWidgetLarge()
    }
}
