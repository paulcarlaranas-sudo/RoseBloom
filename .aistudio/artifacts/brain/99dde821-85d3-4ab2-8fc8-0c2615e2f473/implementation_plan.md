# Post-Login Romantic Portal & Gender-Inclusive Recipient Selection

A dedicated, elegant post-login welcome portal that greets users after signing in, providing clear choices to write a love letter, unlock a letter using a secret passkey, or explore the romantic demo, paired with home navigation and a dynamic "Her Name / His Name / Their Name" recipient dropdown.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural and design decisions below incorporate your confirmed preferences:
> - **Portal Layout**: A romantic 3-card hub offering "Write a Love Letter", "Open Letter with Passkey", and "Explore Sample Demo".
> - **Passkey Interaction**: Selecting "Open with Passkey" triggers the interactive numeric/alphanumeric unlock modal and immediately loads the unlocked letter upon verification.
> - **Navigation Back**: Clicking either the top-left Rosebloom brand mark or the dedicated Home icon button smoothly navigates back to this portal.
> - **Dynamic Pronoun / Recipient Dropdown**: When personalizing the letter, authors can toggle between "Her Name (Girlfriend)", "His Name (Boyfriend)", "Their Name (Partner)", or "Spouse", updating labels, greetings, and salutations dynamically across the entire website.

---

## 1. Overview & Core Concept

### What It Does
1. **Welcome Portal Experience (`/portal` or default post-login view)**:
   Immediately after logging in, users are greeted with a personalized romantic welcome dashboard ("Welcome back, [Name]") presenting three distinct, beautifully designed pathways:
   - **✍️ Write a Love Letter**: Jump straight into the creative studio with fresh or existing letters, photos, songs, and rose ceremony settings.
   - **🔑 Open a Letter with Passkey**: Instant unlock gate for recipients holding a secret anniversary code or share key to reveal a private letter.
   - **🌹 Explore Sample Demo**: Open the full sample experience (Maya & Liam's 2-year monthsary letter) to explore all interactive features.

2. **Always-Accessible Home Navigation**:
   - Pinned **Rosebloom Monthsary** brand logo in the top bar routes directly to the portal.
   - An intuitive **Home icon button** placed next to the brand wordmark and in the 3-bar menu provides unambiguous 1-click return to the portal from any sub-view.

3. **Her / His / Their Name Recipient Dropdown**:
   - Replaces the hardcoded "girlfriend" assumptions with a flexible gender-inclusive selector:
     - 🌸 **Her Name** (Girlfriend / Wife / Fiancée)
     - 🌿 **His Name** (Boyfriend / Husband / Fiancé)
     - ✨ **Their Name** (Partner / Soulmate / Love)
   - Automatically synchronizes greeting headers, subtitles, and letter pronouns (e.g. "A Private Love Letter for Her/Him/Them").

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Authentication (Sign In / Register / Google) ]
                       │
                       ▼
          [ Post-Login Portal Hub ]
   ┌───────────────────┼───────────────────┐
   ▼                   ▼                   ▼
[ 1. Write Letter ] [ 2. Passkey Unlock ] [ 3. Sample Demo ]
   │                   │                   │
   ▼                   ▼                   ▼
Customizer Studio    Interactive Modal   Live Preview
(Full Editor Mode)   Direct Decryption   (Maya & Liam)
   │                   │                   │
   └───────────────────┴───────────────────┘
                       │
             [ Click Top-Left Logo / Home ]
                       │
                       ▼
          [ Return to Portal Hub ]
```

### Visual Identity & Theme
- **Dominant Neutral Canvas (60%)**: Warm alabaster paper (`#FAF7F5` to `#FFF5F7`) with floating glowing dust particles.
- **Structural Surfaces (30%)**: Dual-hairline bordered parchment cards (`#FFFDF9`) accented with subtle botanical flourishes and wax seal motifs.
- **Accent Budget (10%)**: Romantic blush ruby (`#E11D48` / `#BE123C`) and soft emerald accents strictly on primary interactive triggers.
- **Card Hierarchy**:
  1. **Write a Letter Card**: Deep rose gradient border with a fountain pen / envelope icon, labeled "Create or Edit Your Surprise".
  2. **Open with Passkey Card**: Warm gold & wax seal motif with a brass key icon, labeled "Enter Secret Anniversary Code".
  3. **Sample Demo Card**: Soft rose quartz styling with a blooming rose icon, labeled "Preview Full Monthsary Experience".

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Portal Hub vs Immediate Editor Load
- **Chosen Approach**: Route authenticated users to the Portal Hub by default, while preserving a 1-click path to their most recent letter.
- **Why**: Eliminates confusion for recipients or partners who open the app to enter a passcode without needing to see the creator's editing tools.
- **Alternative Considered**: Loading the editor immediately and hiding the passkey tool in the top bar. (Rejected: Cluttered the header and hid recipient access).

### Decision 2: In-Modal Passkey Unlocking vs Standalone Page
- **Chosen Approach**: Directly pop open the existing, highly responsive `PasscodeModal` on top of the portal.
- **Why**: Keeps the experience ultra-fast with zero page reloads, immediately streaming audio and triggering the blooming rose animation upon correct key entry.

### Decision 3: Recipient Type Synchronization
- **Chosen Approach**: Store `recipientType: 'her' | 'his' | 'their' | 'custom'` in `CoupleData`.
- **Why**: Ensures backward compatibility with existing saved letters while effortlessly enabling boyfriend and gender-neutral monthsary websites.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  State: currentRoute ('portal' | 'home' | 'my-work' ...)    │
│  State: activeSite (UserSiteProject)                        │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐
    │     TopNav.tsx     │          │  PortalHubView.tsx │
    │  - Logo -> portal  │          │  - Write Letter    │
    │  - Home Icon Btn   │          │  - Open Passkey    │
    │  - 3-Bar Dropdown  │          │  - Explore Demo    │
    └────────────────────┘          └─────────┬──────────┘
                                              │
               ┌──────────────────────────────┴───────────────┐
               ▼                                              ▼
    ┌─────────────────────┐                        ┌─────────────────────┐
    │  LandingHero.tsx    │                        │  PasscodeModal.tsx  │
    │  - "Her / His Name" │                        │  - Unlocks letter   │
    │    dropdown selector│                        │  - Direct unveil    │
    └─────────────────────┘                        └─────────────────────┘
```

### Data Model Extension
In `src/types.ts`:
```ts
export type RecipientPronoun = 'her' | 'his' | 'their';

export interface CoupleData {
  senderName: string;
  girlfriendName: string; // Partner's display name
  recipientType?: RecipientPronoun; // 'her' | 'his' | 'their'
  recipientRelationLabel?: string; // e.g. "Her Name (Girlfriend)", "His Name (Boyfriend)"
  // ... existing fields
}
```

### Verification & Testing Plan
1. **Navigation Flow**:
   - Verify post-login landing lands on the Portal Hub.
   - Verify clicking "Write a Letter" switches into the Letter Studio.
   - Verify clicking the top-left Rosebloom wordmark or Home icon navigates back to the Portal Hub from any screen.
2. **Passkey Verification**:
   - Verify clicking "Open a Letter with Passkey" immediately opens the unlock modal.
   - Verify entering the correct passkey unlocks and unveils the letter without editor chrome.
3. **Pronoun Dropdown Verification**:
   - Verify toggling between "Her Name", "His Name", and "Their Name" updates labels and preview copy immediately.
   - Verify build and type checking via `compile_applet` and `lint_applet`.
