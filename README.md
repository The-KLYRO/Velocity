<p align="center">
  <img src="public/icon.png" alt="Velocity Logo" width="128" height="128">
</p>

<h1 align="center">Velocity</h1>

<p align="center">
  <strong>High-Performance Bulk Email Management</strong><br>
  A desktop application for composing, scheduling, and tracking bulk email campaigns with precision and speed.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/built_with-Rust-orange.svg" alt="Built with Rust">
  <img src="https://img.shields.io/badge/Tauri-v2-blue.svg" alt="Tauri v2">
  <img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178c6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-4-06b6d4.svg" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version 0.1.0">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platforms">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License: MIT"></a>
</p>

---

## Overview

Velocity is a desktop application built with **Tauri v2** (Rust backend + React frontend) designed for professional bulk email management. It features a **nuexa-inspired dark monochrome UI** with a high-performance Rust engine for SMTP sending, template rendering, and campaign tracking.

The application handles everything from composing personalized emails with rich templates to managing recipient lists, scheduling campaigns, and monitoring delivery reports — all from a single, beautiful interface.

## Features

- **Rich Email Composer** - Gmail-inspired editor with template variable support and HTML preview
- **Recipient Management** - Import, segment, and manage contact lists via CSV/Excel
- **Campaign Engine** - Schedule, pause, and track bulk email campaigns in real-time
- **Template System** - Handlebars-powered templates with dynamic variables and preview
- **SMTP Configuration** - Multi-account SMTP management with connection testing
- **Delivery Reports** - Real-time analytics on sent, delivered, opened, and bounced emails
- **Queue Management** - Priority-based sending queue with rate limiting and retry logic
- **Custom Frameless Window** - Themed title bar with minimize/maximize/close controls
- **Dark Monochrome UI** - Nuexa-inspired gradient surfaces with subtle glass effects

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Rust |
| Desktop Framework | Tauri v2 |
| Frontend | React 19 + TypeScript + Vite |
| Styling | TailwindCSS 4 + Custom CSS Variables |
| State Management | Zustand |
| Data Fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Icons | Material Symbols Outlined |
| Typography | Sora |
| Database | SQLite via SQLx |
| SMTP | lettre |
| Templates | Handlebars |
| File Parsing | csv + calamine (Excel) |

## Prerequisites

- **Rust** (stable)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- **Node.js 18+**
- **Tauri CLI**
  ```bash
  cargo install tauri-cli
  ```

## Project Structure

```
Bulk-Emails/
├── src/                       # React frontend
│   ├── components/ui/         # Reusable UI (button, glass-card, stat-card, etc.)
│   ├── layout/                # sidebar, topbar, app-layout, titlebar
│   ├── pages/                 # dashboard, compose, recipients, campaigns, templates, reports, settings, smtp
│   ├── stores/                # Zustand stores (smtp, campaign, recipient, template, settings, queue, sending)
│   ├── routes/                # React Router config
│   └── types/                 # TypeScript types
├── src-tauri/                 # Rust backend
│   ├── capabilities/          # Tauri v2 permissions
│   ├── src/
│   │   ├── commands/          # Tauri IPC command handlers
│   │   ├── database/          # SQLx migrations + connection
│   │   ├── models/            # Data models
│   │   ├── errors/            # Custom error types
│   │   ├── state/             # AppState with DB pool
│   │   └── config/            # App configuration
│   └── Cargo.toml
├── UI/                        # Design assets & HTML mockups
│   ├── lumina_velocity/       # DESIGN.md — full design system spec
│   └── nuexa-dashboard-main/  # Reference theme
├── public/                    # Static assets (icon)
└── package.json
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/pamod-madubashana/Bulk-Emails.git
cd Bulk-Emails

# Install frontend dependencies
npm install

# Run in development mode
npm run dev          # Vite dev server only
npx tauri dev        # Full desktop app

# Build for production
npx tauri build
```

### Development Commands

```bash
# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm run lint         # ESLint

# Tauri
npx tauri dev        # Run desktop app in dev mode
npx tauri build      # Build desktop installer

# Rust (from src-tauri/)
cargo check          # Type check
cargo build          # Build binary
cargo clippy         # Lint
```

## Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Overview with KPIs, recent activity, and sending queue |
| **Compose** | Rich email editor with template variables and preview |
| **Recipients** | Contact management with import/export and segmentation |
| **Campaigns** | Campaign creation, scheduling, and status tracking |
| **Templates** | Handlebars template editor with variable preview |
| **Reports** | Delivery analytics, open rates, and bounce tracking |
| **Settings** | App configuration, notifications, and email signature |
| **SMTP** | Multi-account SMTP server management |

## Design System

Velocity uses a **nuexa-inspired dark monochrome** design system:

- **Dark Foundation** - Near-black backgrounds (`#0c0d0f`, `#101215`) with radial gradient overlays
- **Gradient Surfaces** - Cards and panels use `rgba(255,255,255,0.07-0.04)` gradient fills
- **Subtle Borders** - White-stroke borders at 8-14% opacity for depth
- **CSS Variable System** - `--bg0`, `--text0`, `--stroke0`, `--panel0` for consistent theming
- **Sora Typography** - Single font family for visual consistency
- **Custom Frameless Window** - Themed title bar with inline window controls

## Development Roadmap

### Completed
- [x] Phase 1: Project initialization with Vite, React, TypeScript, Tailwind
- [x] Phase 2: Tauri v2 backend with Rust skeleton, models, and icons
- [x] Phase 3: Reusable UI components and layout system
- [x] Phase 4: All 8 page implementations
- [x] Phase 5: Zustand stores and TypeScript types
- [x] Phase 6: Rust command skeletons and database migrations
- [x] Phase 7: React Router setup and app wiring
- [x] Phase 8: SMTP sending engine with lettre
- [x] Phase 9: SQLite database operations and migrations
- [x] Phase 10: File import (CSV) for recipients with validation
- [x] Phase 11: Campaign queue management with Zustand stores
- [x] Phase 12: Template management with Handlebars
- [x] Phase 13: Delivery reports with stats and CSV export
- [x] Phase 14: Nuexa theme transformation — custom frameless window, gradient surfaces, monochrome palette

### In Progress
- [ ] Phase 15: Real SMTP connection testing and email sending via Rust backend
- [ ] Phase 16: Real-time delivery tracking with progress updates

### Planned
- [ ] Phase 17: Email sending queue with rate limiting and retry logic (Rust)
- [ ] Phase 18: Drag-and-drop CSV/Excel import with field mapping
- [ ] Phase 19: Campaign scheduling with cron-based automation
- [ ] Phase 20: Email open/click tracking with pixel and webhook integration
- [ ] Phase 21: Template preview with live variable rendering
- [ ] Phase 22: Advanced recipient segmentation and tagging
- [ ] Phase 23: Polish, animations, and performance optimization
- [ ] Phase 24: Cross-platform testing (Windows, macOS, Linux)
- [ ] Phase 25: Code signing and auto-updater integration

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Tauri](https://tauri.app/) - Desktop app framework
- [React](https://react.dev/) - Frontend library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [nuexa-dashboard](https://github.com/pamod-madubashana/nuexa-dashboard) - UI theme reference
- [lettre](https://docs.rs/lettre/) - Rust SMTP library
- [Handlebars](https://handlebarsjs.com/) - Template engine
