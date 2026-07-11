<p align="center">
  <img src="src-tauri/icons/icon.png" alt="Lumina Velocity Logo" width="128" height="128">
</p>

<h1 align="center">Lumina Velocity</h1>

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

Lumina Velocity is a desktop application built with **Tauri v2** (Rust backend + React frontend) designed for professional bulk email management. It combines a glassmorphic dark UI with a high-performance Rust engine for SMTP sending, template rendering, and campaign tracking.

The application handles everything from composing personalized emails with rich templates to managing recipient lists, scheduling campaigns, and monitoring delivery reports — all from a single, beautiful interface.

## Features

- **Rich Email Composer** - Gmail-inspired editor with template variable support and HTML preview
- **Recipient Management** - Import, segment, and manage contact lists via CSV/Excel
- **Campaign Engine** - Schedule, pause, and track bulk email campaigns in real-time
- **Template System** - Handlebars-powered templates with dynamic variables and preview
- **SMTP Configuration** - Multi-account SMTP management with connection testing
- **Delivery Reports** - Real-time analytics on sent, delivered, opened, and bounced emails
- **Queue Management** - Priority-based sending queue with rate limiting and retry logic
- **Dark Glassmorphism UI** - Atmospheric, layered dark theme with neon accents

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Rust |
| Desktop Framework | Tauri v2 |
| Frontend | React 19 + TypeScript + Vite |
| Styling | TailwindCSS 4 + Custom Glassmorphism |
| State Management | Zustand |
| Data Fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Icons | Material Symbols Outlined |
| Typography | Sora (headlines) + Inter (body) |
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
│   ├── components/ui/         # Reusable UI (glass-card, button, badge, etc.)
│   ├── layout/                # sidebar, topbar, app-layout
│   ├── pages/                 # dashboard, compose, recipients, campaigns, templates, reports, settings, smtp
│   ├── stores/                # Zustand stores (smtp, campaign, recipient, template, settings, queue, sending)
│   ├── routes/                # React Router config
│   └── types/                 # TypeScript types
├── src-tauri/                 # Rust backend
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
│   ├── g_sender_dashboard/    # Dashboard mockup
│   ├── advanced_email_composer/ # Compose mockup
│   ├── recipient_management/  # Recipients mockup
│   └── campaign_overview/     # Campaigns mockup
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
| **Dashboard** | Overview with stats, recent campaigns, and quick actions |
| **Compose** | Rich email editor with template support and preview |
| **Recipients** | Contact management with import/export and segmentation |
| **Campaigns** | Campaign creation, scheduling, and status tracking |
| **Templates** | Handlebars template editor with variable preview |
| **Reports** | Delivery analytics, open rates, and bounce tracking |
| **Settings** | App configuration and preferences |
| **SMTP** | Multi-account SMTP server management |

## Design System

Lumina Velocity uses a custom **Dark Glassmorphism** design system defined in `UI/lumina_velocity/DESIGN.md`:

- **Deep Dark Foundation** - Near-black charcoal surfaces with tonal layering
- **Neon Blue Primary** - `#adc6ff` for actions, progress, and active states
- **Purple Secondary** - `#ddb7ff` for accents and data visualization
- **Glassmorphic Cards** - Translucent surfaces with backdrop blur and glass-stroke borders
- **4px Baseline Grid** - Surgical precision in all spacing and alignment

## Development Roadmap

- [x] Phase 1: Project initialization with Vite, React, TypeScript, Tailwind
- [x] Phase 2: Tauri v2 backend with Rust skeleton, models, and icons
- [x] Phase 3: Reusable UI components and layout system
- [x] Phase 4: All 8 page implementations
- [x] Phase 5: Zustand stores and TypeScript types
- [x] Phase 6: Rust command skeletons and database migrations
- [x] Phase 7: React Router setup and app wiring
- [ ] Phase 8: SMTP sending engine with lettre
- [ ] Phase 9: SQLite database operations and migrations
- [ ] Phase 10: Template rendering with Handlebars
- [ ] Phase 11: Campaign queue and scheduling
- [ ] Phase 12: File import (CSV/Excel) for recipients
- [ ] Phase 13: Real-time delivery tracking
- [ ] Phase 14: Polish, animations, and performance optimization

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Tauri](https://tauri.app/) - Desktop app framework
- [React](https://react.dev/) - Frontend library
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [lettre](https://docs.rs/lettre/) - Rust SMTP library
- [Handlebars](https://handlebarsjs.com/) - Template engine
