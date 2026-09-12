# JIGo — One-Stop AI Travel Planning

> Team **bytechick-tenders** · CodeNection 2026

JIGo is an AI-powered travel companion that covers the *entire* journey in one place — gathering inspiration, planning itineraries, navigating on the ground, and preserving memories after the trip. Most travel apps solve one slice of this (discovery, or maps, or expense splitting). JIGo stitches them into a single, intelligent flow so travellers never have to jump between five apps to plan and run one trip.

---

## Table of contents

- [The problem](#the-problem)
- [Our solution](#our-solution)
- [How JIGo answers the brief](#how-jigo-answers-the-brief)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Global UI layout](#global-ui-layout)
- [Feature 1 — Discover (social & content hub)](#feature-1--discover-social--content-hub)
- [Feature 2 — Map & navigation](#feature-2--map--navigation)
- [Feature 3 — Trip planner (itinerary + budget + chat)](#feature-3--trip-planner-itinerary--budget--chat)
- [Feature 4 — AI assistant](#feature-4--ai-assistant)
- [Feature 5 — Profile & memories](#feature-5--profile--memories)
- [Tech stack](#tech-stack)
- [Design language](#design-language)
- [Roadmap](#roadmap)
- [Glossary](#glossary)

---

## The problem

Despite the huge number of travel apps on the market, there is no true **one-stop** product that covers a traveller's whole journey:

1. **Before** — researching destinations and building an itinerary.
2. **During** — navigating, finding amenities, tracking spend, and coordinating with travel partners.
3. **After** — keeping photos, routes, and memories tied to the trip.

Travellers today juggle a social app for inspiration, a maps app for navigation, a spreadsheet for budgets, a chat app for the group, and a photo library for memories. Context is lost at every hand-off.

## Our solution

A comprehensive, intelligent, all-inclusive AI travel planner that brings these stages together. Content discovered in the feed copies straight into an itinerary; itinerary stops open in the map; the map's saved pins are searchable while planning; the group chat, budget, and shared albums all live against the same trip; and an AI agent can draft, replan, and split across every one of these surfaces.

---

## How JIGo answers the brief

The **Lifestyle Track — Planning an Escape** brief asks for one product that plans a trip end to end: budgeting, itinerary building, syncing a group's preferences, and adjusting when plans change — working for solo and group travel alike. Here is how each requirement maps to JIGo, and its status in this repo.

| Brief requirement | Where it lives in JIGo | Status in prototype |
|---|---|---|
| **Budgeting** | Trip → Budget: per-person *ideal vs. actual*, group rollup | ✅ Working |
| **Building an itinerary** | Trip → Plan; copy-from-feed; add-from-map | ✅ Working |
| **Split costs** | Trip → Budget → Add expense (equal or by shares) | ✅ Working |
| **Solo *and* group travel** | Separate solo and group trips in the same account | ✅ Working |
| **Sync group preferences** | AI assistant reconciles members into a shared plan spine | 🟡 Demonstrated (scripted response; no preference-input UI yet) |
| **Re-plan on the fly** (e.g. flight delay) | Delay notification → AI rewrites the affected day | 🟡 Demonstrated (scripted flight-delay scenario) |
| **AI itineraries from budget + interests** | AI assistant drafts day plans | 🟡 Demonstrated (scripted replies; not yet generative) |
| **Live pricing & availability (maps / booking APIs)** | Google Maps view; planned booking + pricing integration | 🔴 Planned (map is display-only; no bookings/flights/stays) |

**Legend:** ✅ working end to end in the prototype · 🟡 present as a scripted/demo flow to show intent · 🔴 not yet built (see [Roadmap](#roadmap)).

> Honesty note for reviewers: the prototype is a **client-only, seeded demo**. The four ✅ rows are fully interactive. The 🟡 rows use scripted data to illustrate the intended AI behaviour rather than a live model. Flights, stays, and live pricing/availability are not implemented yet.

---

## Repository layout

| Folder | Purpose |
|--------|---------|
| [`app/`](app/) | Final executable application *(placeholder — production code lands here)* |
| [`prototype/`](prototype/) | Interactive React/Vite UI prototype demonstrating the full flow |

See each folder's README for setup details.

## Getting started

The clickable prototype is the fastest way to explore the concept.

```bash
cd prototype
npm install
npm run dev
# open http://localhost:5173
```

On Windows you can also double-click `prototype/start-prototype.bat`.

**Optional — Google Maps:** copy `prototype/.env.example` to `prototype/.env` and set `VITE_GOOGLE_MAPS_API_KEY`. Without a key the map falls back to a static preview.

> The prototype renders inside a phone frame with a left rail that lets you jump between screens like Figma pages. Everything is clickable: likes, comments, copy-to-itinerary, map filters, the trail recorder, budget splits, group chat, and the draggable AI button.

---

## Global UI layout

Core navigation is driven by a sleek, rounded-rectangle **bottom navigation bar** with five primary destinations:

| # | Tab | What it does |
|---|-----|--------------|
| 1 | **Discover** | Social feed of travel guides and inspiration |
| 2 | **Map** | Google-Maps-style navigation, pins, and amenities |
| + | **Create** | Center action button — new post, new trip, or new expense |
| 3 | **Trip** | Personal itinerary, group budget, and trip chat |
| 4 | **Me** | Profile, saved albums, footprints, and preferences |

### Floating Action Buttons (FAB)

Imagine the screen split into a 2×3 grid. Two floating icons persistently overlay the right edge without blocking core interactions:

- **Top-right — AI Assistant.** A floating agent that can plan, replan, and split across the app. It is **draggable**, so travellers can move it to whichever side or height suits them (and it lifts clear of the keyboard while chatting).
- **Bottom-right — Chat.** A floating chat head (a touch smaller than a Messenger bubble) for quick access to the active trip conversation.

On the Map screen a third floating control — **Quick Radar** — sits parallel to the AI icon (see [Feature 2](#feature-2--map--navigation)).

---

## Feature 1 — Discover (social & content hub)

The Discover tab is a social-media-style platform: the primary channel for sharing guides, collecting inspiration, and doing research.

### Feed layout & search

- **Waterfall (masonry) grid** for fast, intuitive browsing of guides.
- **Content cards** are image-heavy: a large thumbnail, the author's title acting as a secondary filter, and a **like count** in the bottom-right as a quick quality signal.
- A long, **pill-shaped search bar** sits at the top, with a **User Preferences** button beside it for precise filtering.

**Filter hierarchy**

| Layer | Options |
|-------|---------|
| Base | Country and region |
| Personalization | Travel styles — Slow Travel, Anime-focused, Hardcore/Intense, Budget Master — shown as **colored pill badges** |
| Sorting *(after a search)* | Most Liked · Highest Relevance · Most Saved · Highly Replicable · Following |

**AI in the feed.** A standard screen shows ~4–6 square posts. Because discovery is core to planning, **AI-generated attraction recommendations** occupy the right half of the feed (worth 2–3 posts), tailored to the target region and the user's preferences. AI posts are visually distinct from user posts through different background colors, custom tags, or unique shapes.

### Post detail page

- **Top app bar:** Back button, author avatar, username, a **Follow** button, and a **Share** button.
- **Image gallery:** a swipeable gallery holding ~20–30 photos. A **geographic sequence tag** (1, 2, 3…) in each photo's top-right gives a spatial sense of the itinerary; a transparent page indicator (e.g. `1/30`) sits bottom-right.
- **Rich-text article:** the author's written guide with basic formatting — main title, subtitles, body text, and left/center/right alignment.
- **Interactive itinerary card** — a visual, organized schedule:
  - **Structure:** trip title → subtitles (e.g. *Day 1* or dates) → chronological timestamps.
  - **Attractions:** locations sit next to each timestamp and are auto-linked as clickable places.
  - **Quick actions:** an **Add to Favorites** button beside each stop. Niche or unmapped spots show a **red pin**; tapping it reveals custom address details or the author's remarks.
  - **Copy feature:** a prominent **yellow "Copy to My Itinerary"** button opens a modal to clone the schedule into the traveller's own trip planner.
- **Reviews & ratings:** an overall community rating (5-star UI with text such as *3.5 / 5 Stars*) plus a comments section with avatars, names, individual star ratings, text, and user-uploaded photos.

### Bottom interaction bar (inside a post)

The main five-tab bar is hidden and replaced by a specialized bar:

- **Comment box (left 60–80%):** a pill-shaped input (*"Share your thoughts…"* with a pen icon). If the user scrolls up to reference the article while typing, the box minimizes but safely keeps the text/photo **draft**. Star ratings are optional via a collapsible tag, so users can comment without being forced to rate.
- **Action buttons (right 20–40%):** a prominent **Like** button, with an optional **Save/Bookmark** beside it.

---

## Feature 2 — Map & navigation

- **Search & navigation:** a Google-Maps-style top search bar. A **hamburger menu** (top-left) opens a side drawer covering half the screen.
- **Side drawer menu:**
  - **My Hotel** — set and edit a hotel address for one-tap "return to hotel" routing.
  - **My Pinned Locations** — a list of custom saved places.
  - **My Footprint Recorder** — GPS path tracking (like a running app) recording route, distance, and calories.
    - *Technical requirement:* optimized for **low power consumption** to allow continuous background recording across several days.
    - Provides **Start / Pause / Stop** controls that require a **long-press** to prevent accidental stops.
    - Data **syncs with the itinerary** to become part of the trip memory.
  - **Offline Mode** — download destination maps over Wi-Fi beforehand so navigation works with no connection (sacrificing only real-time data).
- **API integration:** where feasible, use the **Google Maps API**, inheriting its filtering (e.g. *Restaurants nearby*) and POI tags.
- **Quick Radar (floating icon):** parallel to the AI icon. It opens a radar overlay with five emergency/amenity icons in the center — **Toilets, ATMs, Money Changers, Clinics, Convenience Stores**. Selecting one instantly plots the nearest options on the map.
- **Custom location pinning:** to solve the "unknown spot" problem from user guides, travellers can **long-press anywhere** to drop a red pin.
  - **Flow:** long-press → *My Pin* modal → prompt *"Please enter a name"* → show exact coordinates/address → **Save**.
  - **Data loop:** saved pins land in **My Pinned Locations** and become searchable by their custom name while building an itinerary in Discover.

---

## Feature 3 — Trip planner (itinerary + budget + chat)

The Trip tab is the traveller's personal workspace, split into three sub-views for one selected trip. Multiple trips can be kept side by side (e.g. an active group trip and a solo draft).

- **Plan.** A day-by-day timeline of stops with times, ratings, and notes. Stops copied from Discover or added from the Map land here; tapping a stop can open it back on the map. The AI assistant can rewrite a day around a disruption (e.g. a flight delay).
- **Budget.** Per-person **ideal vs. actual** budgets that roll up into a group total, plus a **bill-split** flow (equal or by shares). Confirming an expense updates every participant's actual spend **live** so the group always sees an accurate running cost.
- **Chat.** A trip-scoped group conversation supporting text, shared **locations**, **photos**, **albums**, and **documents** (e.g. dropping a rail-pass PDF so nobody hunts for it later). Solo trips keep a private thread for personal notes.

> These planner, budget, and chat surfaces extend the original spec — they turn Discover's shared guides into a coordinated, trackable group trip.

---

## Feature 4 — AI assistant

A conversational agent available anywhere via the draggable top-right FAB. It works across every surface rather than being a standalone chatbot:

- **Draft** itineraries from a region, budget, and travel style.
- **Replan** a day around real-world disruptions (delays, closures) while respecting held tickets and budget.
- **Sync group taste** — reconcile different members' preferences into a shared "spine" for the trip.
- **Split** a bill and record it against the trip budget.
- Seeds the feed with tailored **attraction recommendations** (see [Feature 1](#feature-1--discover-social--content-hub)).

---

## Feature 5 — Profile & memories

- Personal profile with trip count and travel-style **preferences** that feed feed personalization.
- **Albums** — trip photo collections that double as post-trip memories, linked to itineraries and footprints.
- **Friends / following** management for the social graph behind Discover and trip chat.
- A toggle to park the AI FAB on the left or right side.

---

## Tech stack

| Area | Choice |
|------|--------|
| Prototype UI | React 18 + Vite 6 |
| Maps | Google Maps API *(optional key; static fallback without one)* |
| State | Local React state in the prototype *(client-only, no backend yet)* |
| Target | Mobile-first; the prototype renders inside a phone frame |

> The prototype is a **client-only clickable demo**: data is seeded in `prototype/src/data.js` and there is no server, authentication, or persistence yet. The `app/` folder is reserved for the production build.

## Design language

- **Warm, rounded, playful.** Soft phone frame, rounded-rectangle nav bar, pill-shaped chips and search.
- **Signal colors.** A prominent **yellow** "Copy to My Itinerary" action; **coral** for live/active states; **navy** AI accents.
- **Distinct AI surfaces.** AI-generated content is visually separated from user content via color, tags, and shape.

## Roadmap

Ordered to close the gaps against the brief first:

- [ ] **Live pricing & availability** via maps/booking APIs — flights, stays, and activities surfaced inside the planner. *(brief requirement, not yet started)*
- [ ] **Generative AI itineraries** from real budget + interests, writing directly into the plan. *(currently scripted)*
- [ ] **Group preference sync** — a real input flow that reconciles members into a shared itinerary. *(currently scripted)*
- [ ] **On-the-fly re-planning** driven by live disruption data instead of a fixed scenario. *(currently scripted)*
- [ ] Real backend: accounts, persistence, and sync across surfaces.
- [ ] Live Google Maps directions, POI tags, and offline map packs.
- [ ] Background, low-power GPS footprint recording across multi-day trips.
- [ ] Migrate the validated prototype flow into `app/`.

## Glossary

| Term | Meaning |
|------|---------|
| **Guide / Post** | A shared travel write-up with photos, article, and an itinerary card |
| **Itinerary card** | The structured, copyable schedule inside a guide |
| **Copy to My Itinerary** | Cloning a guide's schedule into your own trip planner |
| **Pin** | A saved map location (built-in POI or custom long-press pin) |
| **Quick Radar** | Map overlay for nearby toilets, ATMs, money changers, clinics, and stores |
| **Footprint** | A recorded GPS route with distance and calories, tied to a trip |
| **Trail** | The live path captured while the footprint recorder is running |
