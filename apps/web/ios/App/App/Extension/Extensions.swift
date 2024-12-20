//
//  Extensions.swift
//  App
//
//  Created by Galvin Gao on 10/21/23.
//

import CryptoKit
import Foundation
import SwiftUI
import UIKit

extension UIColor {
    convenience init(red: Int, green: Int, blue: Int) {
        assert(red >= 0 && red <= 255, "Invalid red component")
        assert(green >= 0 && green <= 255, "Invalid green component")
        assert(blue >= 0 && blue <= 255, "Invalid blue component")

        self.init(red: CGFloat(red) / 255.0, green: CGFloat(green) / 255.0, blue: CGFloat(blue) / 255.0, alpha: 1.0)
    }

    convenience init(rgb: Int) {
        self.init(
            red: (rgb >> 16) & 0xFF,
            green: (rgb >> 8) & 0xFF,
            blue: rgb & 0xFF
        )
    }

    var color: Color {
        return Color(self)
    }
}

enum AppError {
    case custom(errorDescription: String?)

    class Enums {}
}

extension AppError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case let .custom(errorDescription): return errorDescription
        }
    }
}

extension Data {
    func sha256() -> String {
        let hash = SHA256.hash(data: self)
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }
}
