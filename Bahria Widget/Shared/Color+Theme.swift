import SwiftUI

// MARK: - App Theme

extension Color {
    // Primary gradient
    static let accentGradientStart = Color(hue: 0.72, saturation: 0.65, brightness: 0.95)  // Indigo
    static let accentGradientEnd   = Color(hue: 0.80, saturation: 0.55, brightness: 0.90)    // Purple
    
    // Urgency colors
    static let urgencyNormal   = Color(hue: 0.45, saturation: 0.60, brightness: 0.85)  // Teal
    static let urgencyWarning  = Color(hue: 0.10, saturation: 0.70, brightness: 0.95)  // Amber
    static let urgencyCritical = Color(hue: 0.00, saturation: 0.70, brightness: 0.90)  // Red
    static let urgencyOverdue  = Color(hue: 0.95, saturation: 0.75, brightness: 0.60)  // Deep Red
    
    // Card backgrounds (cross-platform safe)
    static let cardBackground     = Color.gray.opacity(0.15)
    static let cardBorder         = Color.white.opacity(0.08)
    static let cardHighlight      = Color.white.opacity(0.04)
    
    // Text (cross-platform safe)
    static let textPrimary   = Color.primary
    static let textSecondary = Color.secondary
    static let textTertiary  = Color.gray
}

// MARK: - Urgency Color Mapping

extension Assignment.UrgencyLevel {
    var color: Color {
        switch self {
        case .normal:   return .urgencyNormal
        case .warning:  return .urgencyWarning
        case .critical: return .urgencyCritical
        case .overdue:  return .urgencyOverdue
        }
    }
    
    var label: String {
        switch self {
        case .normal:   return "On Track"
        case .warning:  return "Due Soon"
        case .critical: return "Urgent"
        case .overdue:  return "Overdue"
        }
    }
    
    var icon: String {
        switch self {
        case .normal:   return "checkmark.circle.fill"
        case .warning:  return "exclamationmark.triangle.fill"
        case .critical: return "flame.fill"
        case .overdue:  return "xmark.octagon.fill"
        }
    }
}

// MARK: - Gradient Presets

extension LinearGradient {
    static let appAccent = LinearGradient(
        colors: [.accentGradientStart, .accentGradientEnd],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let cardShine = LinearGradient(
        colors: [Color.white.opacity(0.06), Color.clear],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let widgetBackground = LinearGradient(
        colors: [
            Color(hue: 0.72, saturation: 0.30, brightness: 0.15),
            Color(hue: 0.78, saturation: 0.25, brightness: 0.10),
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
