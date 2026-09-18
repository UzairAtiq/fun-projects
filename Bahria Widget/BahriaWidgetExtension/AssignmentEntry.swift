import WidgetKit

struct AssignmentEntry: TimelineEntry {
    let date: Date
    let assignments: [Assignment]
    let lastUpdated: Date?
    let error: String?
    
    static let placeholder = AssignmentEntry(
        date: Date(),
        assignments: Assignment.sampleList,
        lastUpdated: Date(),
        error: nil
    )
    
    static let empty = AssignmentEntry(
        date: Date(),
        assignments: [],
        lastUpdated: nil,
        error: nil
    )
}
