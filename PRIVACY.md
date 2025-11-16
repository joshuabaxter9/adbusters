# Privacy Policy for AdBusters

**Last Updated: November 16, 2025**

## Overview

AdBusters is a privacy-focused Chrome extension that blocks advertisements with a fun, Ghostbusters-themed interface. This privacy policy explains how the extension handles data.

## Data Collection

**AdBusters does not collect, store, or transmit any personal data or user information.**

We do not collect:

- Personal information (name, email, address, etc.)
- Browsing history
- Website content
- User activity or behavior
- Location data
- Any personally identifiable information

## Local Storage

The extension stores minimal data locally on your device using Chrome's local storage API:

- **Ghost Count**: Number of ads blocked during your session
- **Extension State**: Whether blocking is enabled or disabled
- **PKE Meter Data**: Capacity and purge count for the gamification feature
- **User Preferences**: Your extension settings

**Important**: This data:

- Never leaves your device
- Is not transmitted to any external servers
- Is not shared with any third parties
- Can be cleared by uninstalling the extension

## Permissions Explained

AdBusters requires certain permissions to function. Here's why:

### declarativeNetRequest

Used to block network requests to known advertising domains at the network level. This prevents ads from loading, improving page performance and reducing bandwidth usage.

### declarativeNetRequestFeedback

Allows the extension to count how many ad requests were blocked, which powers the "Ghosts Trapped" counter feature.

### storage

Required to save your preferences and settings locally on your device.

### activeTab

Needed to communicate with the active tab to display interactive monster capture animations when ads are blocked.

### host_permissions (<all_urls>)

Required to detect and block advertisements across all websites you visit. The extension needs access to web pages to identify ad elements and replace them with monster graphics.

## Third-Party Services

AdBusters does not use:

- Analytics services
- Tracking tools
- External APIs
- Cloud services
- Third-party libraries that collect data

## Data Sharing

We do not sell, trade, rent, or transfer any user data to third parties because we don't collect any user data in the first place.

## Security

Since no data is collected or transmitted, there is no risk of data breaches or unauthorized access to your personal information through this extension.

## Children's Privacy

AdBusters does not knowingly collect any information from anyone, including children under 13.

## Open Source

AdBusters is built with transparency in mind. The source code is available for review, and you can verify that no data collection occurs.

## Changes to This Policy

If we make changes to this privacy policy, we will:

- Update the "Last Updated" date at the top
- Post the updated policy in the Chrome Web Store listing
- Notify users through the extension if significant changes occur

## Your Rights

You have the right to:

- Use the extension without providing any personal information
- Disable or uninstall the extension at any time
- Clear all locally stored data by uninstalling the extension

## Contact

If you have questions or concerns about this privacy policy, please contact:

- **GitHub Issues**: [Create an issue on our repository]
- **Email**: [Your contact email - optional]

## Compliance

This extension complies with:

- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)

## Consent

By installing and using AdBusters, you consent to this privacy policy.

---

**Summary**: AdBusters is a privacy-first extension that doesn't collect any user data. Everything happens locally on your device, and nothing is transmitted externally.
