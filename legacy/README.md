# Device Integrity Risk Scorer (DIRS) — Android Security Auditing Tool

DIRS is a professional-grade web application designed to evaluate the security level and integrity of Android devices. It analyzes various security vectors, from hardware-backed attestation to runtime configurations, providing a comprehensive risk score and actionable remediation steps.

## 🌟 Features

- **Multi-Domain Scoring**: Evaluate 7 key security areas (System Integrity, Privileges, Network Security, Encryption, App Permissions, OS Version, and Runtime Behavior).
- **Interactive Risk Analysis**: Real-time simulation of device scanning with detailed step-by-step reporting.
- **Dynamic Data Visualization**: Radar charts, gauges, and comparison bars for intuitive risk assessment.
- **Audit Reports**: Generate and export professional PDF/HTML reports compliant with industry standards like **OWASP MASVS** and **CIS Android Benchmark**.
- **Remediation Planning**: Prioritized recommendations to improve the device's security posture.

## 🚀 Getting Started

Simply open `index.html` in any modern web browser. No installation or server-side backend is required (standalone SPA).

### Project Structure

```
android-risk-scorer/
├── index.html          # Main application entry point
├── css/
│   └── main.css        # Premium design system & animations
├── js/
│   ├── scanner.js      # Scoring engine & vulnerability logic
│   ├── charts.js       # Canvas visualization components
│   ├── report.js       # Detailed report generator
│   └── app.js          # Main application controller
└── README.md           # Project documentation
```

## 🛡️ Security Domains

The DIRS engine calculates a composite score (0-100) based on weighted categories:
- **System Integrity (20%)**: Bootloader status, Verified Boot (AVB), dm-verity.
- **Elevation of Privileges (20%)**: Root access detection, Magisk/SuperSU presence, ADB status.
- **Network Security (15%)**: VPN usage, DNS encryption (DoH/DoT), WiFi protocols.
- **Encryption & Data (15%)**: Full-disk/File-based encryption, TEE KeyStore, Biometrics.
- **Apps & Permissions (15%)**: Play Protect status, Unknown sources configuration.
- **OS Health (10%)**: Android version longevity and Security Patch age.
- **Runtime Protections (5%)**: SELinux mode (Enforcing vs Permissive), ASLR status.

## 📄 Compliance Standards

DIRS maps identified vulnerabilities to:
- **OWASP MASVS** (Mobile Application Security Verification Standard)
- **CIS Android Benchmark**
- **NIST SP 800-124**

---

*Disclaimer: This tool is intended for educational and security audit demonstration purposes. For production environments, use certified attestation APIs like Google Play Integrity API.*
