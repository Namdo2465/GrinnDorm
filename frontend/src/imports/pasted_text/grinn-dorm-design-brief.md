GrinnDorm Figma Design Brief (Creative Freedom)

1. Project Overview

 - App Name: GrinnDorm
 - Purpose: Anonymous but verified dorm rating website for Grinnell College students
 - Platform: Web (responsive: desktop, tablet, mobile)
 - Target Users: College students browsing dorms and leaving reviews
 - College: Grinnell College (Iowa)

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

2. Design Direction (Creative Freedom)

Please design with:

 - Modern, clean aesthetic
 - Professional but approachable (appeals to college students)
 - Good contrast and readability
 - Scalable component system
 - Smooth, intuitive interactions

The only design constraint:

 - Include Grinnell College's official red as an accent color somewhere (for school spirit)
 - Include a squirrel icon/mascot in the branding (Grinnell's mascot)

Otherwise, you decide: colors, typography, spacing, component style, animations—whatever makes this look great!

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

3. Core Features & Pages

Global Navigation

 - Logo with squirrel mascot + "GrinnDorm" text
 - Search functionality (if user is logged in)
 - User account menu (Login/Logout/Profile)
 - Responsive hamburger menu for mobile

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Page 1: Authentication (Login/Signup)

User Flow:

 1. Enter email → see "Send Verification Code" button
 2. Receive 6-digit code via email
 3. Enter code → see "Verify" button
 4. Success → redirect to home

Design considerations:

 - Center the form, minimal distractions
 - Show loading states
 - Clear error messaging
 - Confirmation screen before redirect

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Page 2: Home Page (Campus Map)

Layout:

 - Main content: Interactive campus map (image of Grinnell College campus)
 - Map interaction:
 - Show draggable squirrel avatar that user can move around the map
 - Hover over buildings → tooltips showing dorm names
 - Drag squirrel near buildings → display nearby dorms in a panel
 - Click dorm name → navigate to dorm details page
 - Sidebar/Panel: "Nearby Dorms" list showing:
 - Dorm name
 - Average rating
 - Quick access button to view reviews
 - Empty state if no dorms nearby

Design considerations:

 - Map should be the focal point
 - Squirrel should be charming and easy to drag
 - Responsive: on mobile, maybe sidebar becomes a bottom sheet

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Page 3: Dorm Details Page

Content:

 - Dorm name, campus location, average rating, review count
 - Link to school's official dorm info page
 - List of reviews (each showing):
 - Anonymous name (e.g., "Anonymous Tiger #42")
 - Star rating
 - Comment text
 - Timestamp
 - Vote buttons: upvote/downvote arrows with net score between them
 - Color coding: green if positive, red if negative, gray if zero
 - Only logged-in users can vote
 - "Submit Review" button (prominent, sticky or fixed)

Design considerations:

 - Reviews should be scannable cards
 - Vote buttons should be intuitive (upvote/downvote visual pattern is standard)
 - Make the review form easy to access

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Page 4: Submit Review Modal

Content:

 - Modal title
 - Star rating selector (1-5 stars, clickable)
 - Text area for comment
 - Submit & Cancel buttons

Design considerations:

 - Modal should feel like a focused task
 - Star interaction should have nice hover effects
 - Clear call-to-action

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Page 5: Search & Filter Panel (on Home or as drawer)

Components:

 - Search input: "Search dorms..."
 - Filter by rating (dropdown or buttons: All, 4+, 3+, etc.)
 - Filter by campus area (buttons: All, North, South, East, West, Off-Campus)
 - Filters work in real-time as user types

Design considerations:

 - Should feel integrated into the design, not tacked on
 - Active filter states should be visually clear

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

4. Design System to Create

Please build a component library with:

 - Button styles (primary, secondary, disabled, loading)
 - Input fields (text, focus states, error states)
 - Cards (for reviews, dorm listings)
 - Modals
 - Star rating component
 - Vote button component (upvote/downvote)
 - Tooltips
 - Notifications/alerts

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

5. Key Interactions

Campus Map Squirrel

 - Smooth drag interaction
 - Squirrel follows cursor when dragging
 - Nearby dorms update as squirrel moves
 - Visual feedback when hovering over buildings

Vote Buttons

 - Click to upvote/downvote
 - Instant visual feedback (animation on click)
 - Color change reflecting vote state
 - Can switch vote or remove vote

Forms

 - Real-time validation feedback
 - Clear error messages
 - Loading states on submission

Navigation

 - Smooth transitions between pages
 - Back navigation should always be available

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

6. Responsive Design

Design for three breakpoints:

 - Desktop: 1440px (full two-column layout: map + sidebar)
 - Tablet: 768px (single column, responsive)
 - Mobile: 375px (touch-friendly, bottom sheets/drawers instead of sidebars)

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

7. Accessibility

 - WCAG AA compliant contrast ratios
 - Keyboard-navigable (all interactive elements)
 - Minimum 44px touch targets
 - Descriptive alt text for images

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

8. Deliverables

 - High-fidelity mockups for all pages
 - Interactive prototype (if possible in Figma)
 - Component library/design system
 - Style guide (colors, typography, spacing)
 - Responsive designs for all breakpoints


