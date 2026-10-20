# Revised Implementation Plan: 5-Character Letter Code & "Done Editing" Sharing Experience

## Problem & User Goal
1. **5-Character Recipient Code**: When creating a love letter, a unique 5-character alphanumeric code (e.g., `R8K2M`) is generated and synced to Cloud Firestore. When entered in the recipient flow, the letter is retrieved across any device. If a private 4-digit passcode was configured by the creator, it is prompted after entering the 5-character code.
2. **"Done" Button Below Letter Editing**: While editing the love letter, provide a clear, elegant "Done" button at the bottom of the letter editor. Clicking it saves any edits and pops up the Share & Publish modal offering options to share via **5-Character Code**, **Direct Private Link**, or **Scannable QR Code**, reassuring the creator that their letter is unique, encrypted, and cannot be accessed or modified by others.

---

## Proposed Changes

### 1. 5-Character Unique Code Generator & Cloud Sync (`src/services/siteService.ts` & `src/types.ts`)
- **5-Character Generator**: Replace `generateShareCode()` with a 5-character uppercase alphanumeric generator using high-clarity characters (excluding easily confused characters like `0`/`O` and `1`/`I`, e.g., `R8K2M`, `H7N4Q`).
- **Initial & Existing Sites**: Update default sites to standard 5-character codes (e.g., `ROSE1`, `MAYA5`).
- **Cloud Firestore Indexing**: Ensure all letters are saved under `users/{userId}/sites/{siteId}` and published to `shared_sites/{5CharUpperCode}` so any recipient device can immediately query and open the letter.
- **Cross-Device Fetch**: In `fetchSiteForReceiverFromCloud(code)`: query `shared_sites` by 5-character code case-insensitively and cache locally for offline access.

### 2. "Done" Button in Letter Editor (`src/components/LoveLetter.tsx` & `src/App.tsx`)
- **Bottom Action in Edit Mode**:
  - Add a primary **"Done & Share Letter 💌"** button next to "Save Letter" inside the editor form.
  - In the action bar immediately below the letter card, add an eye-catching romantic button: **"Done Editing — Share Letter"** (with icon, previewing code/link/QR).
- **Callback Integration**:
  - Wire `onOpenShareModal` into `LoveLetter.tsx` props. Clicking "Done" automatically persists current edits to the letter and opens the `SharePublishModal`.

### 3. Share & Publish Modal Enhancements (`src/components/SharePublishModal.tsx`)
- **Header & Uniqueness Banner**:
  - Add clear reassurance: *"Your letter is private & unique. Only someone with your 5-character code or secret link can open it."*
- **Three Prominent Sharing Methods**:
  1. **5-Character Letter Code**: Displayed in large, high-contrast monospace font with a 1-click "Copy Code" button and instructions for recipients (*"Tell your partner to enter this code on the home page"*).
  2. **Direct Private Link**: One-click copy and native device share button.
  3. **High-Resolution QR Code**: Scannable QR code linking directly to the letter, with an option to download the romantic keepsake QR image.
- **Security & Passcode Indicator**: If a 4-digit passcode is enabled on the letter, display a badge confirming that recipients will also be prompted for their secret 4-digit PIN.

### 4. Recipient Lookup & Two-Step Passcode Flow (`src/components/ReceiverCodeModal.tsx` & `src/App.tsx`)
- **5-Character Recipient Input**:
  - Configure `ReceiverCodeModal` with a 5-slot or formatted 5-character uppercase input field with instant validation and a loading spinner.
- **Two-Step Unlock Sequence**:
  - Clicking "For Recipients / Open with Code" on the home page (`PortalHub`) opens `ReceiverCodeModal`.
  - Recipient enters the 5-character code. App queries Firestore `shared_sites`.
  - If found:
    - If letter has `passcode.enabled = true`, seamlessly transition to the 4-digit PIN unlock dialog.
    - If no passcode (or once PIN is verified), switch into receiver mode (`isReceiverMode = true`, route `'home'`) and trigger the romantic `RoseBloomExperience`.

### 5. Creator Visibility Across the Portal
- **Letter Editor Header / TopNav**: Show the active letter's 5-character code with a copy icon in creator mode.
- **My Letters Dashboard (`src/pages/MySitesPage.tsx`)**: Display the 5-character code badge on each letter card.

---

## Verification Plan

### Automated Checks
- Run `compile_applet` to verify successful TypeScript compilation.
- Run `lint_applet` to check for syntax or styling warnings.

### Functional Verification
1. **Letter Editing & "Done" Button**:
   - Open letter in edit mode. Edit text and click "Done & Share Letter".
   - Verify edits save and the Share modal opens immediately.
2. **Share Modal Options**:
   - Check the 5-character code tab, link tab, and QR code tab.
   - Verify copy button works and confirms with feedback.
3. **Recipient Flow**:
   - Return to home page, click "Open a Letter" under "For Recipients".
   - Enter the 5-character code.
   - Verify Firestore retrieves the exact letter and triggers the romantic blooming rose experience.
4. **Passcode Protection**:
   - Enable 4-digit PIN on a letter.
   - Test recipient unlock: enter 5-character code, verify 4-digit PIN prompt appears, enter PIN, and verify letter opens.
