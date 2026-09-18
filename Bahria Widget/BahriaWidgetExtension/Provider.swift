import WidgetKit

struct AssignmentTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> AssignmentEntry {
        .placeholder
    }
    
    func getSnapshot(in context: Context, completion: @escaping (AssignmentEntry) -> Void) {
        if context.isPreview {
            completion(.placeholder)
            return
        }
        let cache = SharedDataManager.loadAssignments()
        let entry = AssignmentEntry(
            date: Date(),
            assignments: cache.assignments,
            lastUpdated: cache.lastUpdated,
            error: cache.error
        )
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<AssignmentEntry>) -> Void) {
        let cache = SharedDataManager.loadAssignments()
        let entry = AssignmentEntry(
            date: Date(),
            assignments: cache.assignments,
            lastUpdated: cache.lastUpdated,
            error: cache.error
        )
        // Refresh widget every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}
