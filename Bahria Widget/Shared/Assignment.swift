import Foundation

// MARK: - Assignment Model

struct Assignment: Codable, Identifiable, Hashable {
    var id: String { "\(course)|\(title)" }
    let title: String
    let course: String
    let deadlineRaw: String
    let deadline: Date?
    let link: String
    
    enum CodingKeys: String, CodingKey {
        case title, course, deadlineRaw, deadline, link
    }
    
    init(title: String, course: String, deadlineRaw: String, deadline: Date?, link: String) {
        self.title = title
        self.course = course
        self.deadlineRaw = deadlineRaw
        self.deadline = deadline
        self.link = link
    }
    
    // MARK: - Urgency
    
    enum UrgencyLevel: String, Codable {
        case normal    // > 3 days
        case warning   // 1-3 days
        case critical  // < 24 hours
        case overdue   // past deadline
    }
    
    var urgencyLevel: UrgencyLevel {
        guard let deadline else { return .normal }
        let remaining = deadline.timeIntervalSinceNow
        if remaining < 0 { return .overdue }
        if remaining < 24 * 3600 { return .critical }
        if remaining < 3 * 24 * 3600 { return .warning }
        return .normal
    }
    
    // MARK: - Remaining Time
    
    var remainingTimeInterval: TimeInterval? {
        guard let deadline else { return nil }
        let remaining = deadline.timeIntervalSinceNow
        return remaining > 0 ? remaining : nil
    }
    
    var remainingTimeFormatted: String {
        guard let deadline else { return "No deadline" }
        let remaining = deadline.timeIntervalSinceNow
        
        if remaining < 0 {
            return "Overdue"
        }
        
        let days = Int(remaining) / 86400
        let hours = (Int(remaining) % 86400) / 3600
        let minutes = (Int(remaining) % 3600) / 60
        let seconds = Int(remaining) % 60
        
        if days > 0 {
            return "\(days)d \(hours)h \(minutes)m"
        } else if hours > 0 {
            return "\(hours)h \(minutes)m \(seconds)s"
        } else {
            return "\(minutes)m \(seconds)s"
        }
    }
    
    var deadlineFormatted: String {
        guard let deadline else { return deadlineRaw.isEmpty ? "No deadline" : deadlineRaw }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy 'at' h:mm a"
        return formatter.string(from: deadline)
    }
    
    // MARK: - Sample Data
    
    static let sample = Assignment(
        title: "Assignment 1 - Database Design",
        course: "CS-310 Database Systems",
        deadlineRaw: "15-May-2026 11:59 PM",
        deadline: Date().addingTimeInterval(2 * 86400),
        link: "https://lms.bahria.edu.pk/Student/Assignments/"
    )
    
    static let sampleList: [Assignment] = [
        Assignment(title: "Lab Report 5", course: "PHY-201 Applied Physics",
                   deadlineRaw: "10-May-2026 11:59 PM",
                   deadline: Date().addingTimeInterval(8 * 3600), link: ""),
        Assignment(title: "Assignment 3 - ER Diagrams", course: "CS-310 Database Systems",
                   deadlineRaw: "12-May-2026 11:59 PM",
                   deadline: Date().addingTimeInterval(3 * 86400), link: ""),
        Assignment(title: "Final Project Proposal", course: "CS-450 Software Engineering",
                   deadlineRaw: "20-May-2026 11:59 PM",
                   deadline: Date().addingTimeInterval(10 * 86400), link: ""),
    ]
}

// MARK: - Scraper Output Parsing

struct ScraperOutput: Codable {
    let status: String
    let code: Int?
    let message: String?
    let timestamp: String?
    let assignments: [ScrapedAssignment]
}

struct ScrapedAssignment: Codable {
    let title: String
    let course: String
    let deadline: String
    let link: String
    
    func toAssignment() -> Assignment {
        Assignment(
            title: title,
            course: course,
            deadlineRaw: deadline,
            deadline: DateParsingHelper.parse(deadline),
            link: link
        )
    }
}

// MARK: - Date Parsing Helper

enum DateParsingHelper {
    private static let formats = [
        "dd-MMM-yyyy hh:mm a",
        "dd-MMM-yyyy HH:mm",
        "yyyy-MM-dd HH:mm:ss",
        "yyyy-MM-dd'T'HH:mm:ss",
        "dd/MM/yyyy hh:mm a",
        "dd/MM/yyyy HH:mm",
        "MMM dd, yyyy hh:mm a",
        "MMM dd, yyyy HH:mm:ss",
        "dd-MM-yyyy hh:mm a",
        "dd-MM-yyyy HH:mm:ss",
    ]
    
    static func parse(_ string: String) -> Date? {
        let trimmed = string.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty { return nil }
        
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        
        for format in formats {
            formatter.dateFormat = format
            if let date = formatter.date(from: trimmed) {
                return date
            }
        }
        return nil
    }
}
