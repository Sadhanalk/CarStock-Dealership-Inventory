# CarStock Dealership Inventory — Plan

## Implementation approach

CarStock is a two-part full-stack kata: a FastAPI REST API backed by persistent SQLite and a React/Vite SPA styled with Tailwind CSS. The API owns authentication, role checks, validation, filtering, and atomic inventory mutations. The SPA stores a JWT in session storage, uses relative `/api` requests, and presents customer and admin workflows from the same dashboard. The project deliberately keeps the API and UI independently testable and easy to run locally.

The backend uses SQLAlchemy models for `User` and `Vehicle`, standard-library password hashing, signed JWT access tokens, an admin seed account, and sample inventory. Purchase uses a guarded update inside a transaction so quantity cannot go below zero. The Vite dev server proxies `/api` to FastAPI during local development.

## Project structure

- `backend/app/`: API configuration, database session, ORM models, schemas, auth utilities, and route handlers.
- `backend/tests/`: API-level tests for registration/login, role enforcement, vehicle CRUD, filters, purchase, restock, and validation.
- `frontend/src/`: React application, API client helpers, dashboard components, forms, and Tailwind CSS.
- (removed) preview route manifest
- `README.md`: local setup, API reference, test commands, demo credentials, and AI-use disclosure.
- `PROMPTS.md`: raw project prompt record required by the kata.

## Design direction

### Options considered

- **Neo-industrial showroom** (0.07): dark graphite surfaces, warm amber accents, crisp inventory cards, and workshop-inspired labels.
- **Quiet luxury catalog** (0.05): ivory canvas, restrained serif headings, and editorial vehicle cards.
- **Electric utility dashboard** (0.08): pale stone background, ink typography, and high-contrast orange action states.

### Selected: neo-industrial showroom

- **Design movement:** Neo-industrial showroom, balancing dealership confidence with an operations-console feel.
- **Core principles:** Stock clarity first; strong hierarchy; tactile but restrained surfaces; fast, low-friction actions.
- **Color philosophy:** Graphite and bone provide dependable contrast, while amber signals movement, inventory attention, and purchase intent without feeling like a generic SaaS blue.
- **Layout paradigm:** A left rail anchors brand and session context; the main workspace uses a wide editorial header, filter strip, and asymmetric vehicle grid with compact admin controls.
- **Signature elements:** Amber signal line under section titles, monospaced inventory labels, and thin framed cards with status chips.
- **Interaction philosophy:** Every mutation gives immediate feedback; destructive actions are explicit; disabled purchase states explain scarcity instead of simply blocking clicks.
- **Animation:** Small, purposeful transitions only—card lift on hover, status-chip transitions, and a subtle loading pulse for async actions.
- **Typography system:** Plus Jakarta Sans for interface text and Space Mono for IDs, stock labels, and metadata.
- **Brand essence:** “The calm, decisive control room for vehicle stock.” Personality: precise, confident, tactile.
- **Brand voice:** Headings say what matters (“Move the right metal”) and microcopy stays direct (“Reserve one from stock”).
- **Wordmark & logo:** A compact `CS//` monogram framed by a vertical amber signal bar.
- **Signature brand color:** Signal amber `#F0A84B`.
