# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org).

## [1.0.0] - 2026-10-04

First production-ready release.

### Added
- Customer storefront: dress browsing, availability, cart, checkout with GCash receipt upload, fittings, wishlist and live rental status.
- Admin dashboard: rentals, dresses, hero dresses, size guide, how-it-works, fittings and user roles.
- Database-enforced rules: row level security, `create_rental()`, `book_fitting()`, double-booking prevention and private receipt storage.
- Toast notifications (Sonner), loading skeletons and spinners.
- "Coming soon" frames on the hero when no dress is attached.
- CI pipeline running lint, unit tests, database tests and build.

### Changed
- Admin sign-in now uses the shared login page; admins are redirected to the dashboard.
- Admin header tabs and sign-out aligned with page content.
