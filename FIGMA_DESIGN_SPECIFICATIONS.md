# SciDataHub - Complete Figma Design Specifications

## 🎨 Design System Overview

### Color Palette
**Primary Colors:**
- Indigo: #4F46E5 (Primary brand color)
- Purple: #7C3AED (Accent color)
- Blue: #3B82F6 (Information)
- Green: #10B981 (Success)
- Orange: #F59E0B (Warning)
- Red: #EF4444 (Error)

**Neutral Colors:**
- Gray-50: #F9FAFB (Light background)
- Gray-100: #F3F4F6 (Card backgrounds)
- Gray-200: #E5E7EB (Borders)
- Gray-300: #D1D5DB (Disabled states)
- Gray-600: #4B5563 (Secondary text)
- Gray-700: #374151 (Primary text)
- Gray-800: #1F2937 (Dark surfaces)
- Gray-900: #111827 (Dark backgrounds)

**Dark Mode Colors:**
- Background: #0F172A → #1E293B gradient
- Surface: #1E293B/80 with backdrop blur
- Text Primary: #F1F5F9
- Text Secondary: #CBD5E1
- Border: #334155

### Typography
**Fonts:**
- Primary: Inter, system-ui, sans-serif
- Headings: Weight 600-800
- Body: Weight 400-500
- Captions: Weight 400

**Scale:**
- H1: 48px (3rem) - Hero titles
- H2: 36px (2.25rem) - Page titles
- H3: 24px (1.5rem) - Section titles
- H4: 20px (1.25rem) - Card titles
- Body: 16px (1rem) - Regular text
- Small: 14px (0.875rem) - Captions

### Spacing System
**Base Unit: 4px**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Border Radius
- Small: 6px (buttons, inputs)
- Medium: 8px (cards)
- Large: 12px (containers)
- XL: 16px (modals)

## 📱 Screen Specifications

### 1. Landing Page (Home)
**Layout:** Full-width with navigation
**Sections:**
1. **Hero Section**
   - Gradient background: blue-50 to indigo-100
   - Large heading with gradient text effect
   - Two CTAs: "Get Started" and "Explore Data"
   - Decorative background elements (floating orbs)

2. **Features Section**
   - 6 feature cards in 3x2 grid
   - Each card: Icon + Title + Description
   - Icons: Upload, CheckCircle, Users, BarChart, Shield, Database

3. **User Types Section**
   - 4 user type cards
   - Profile icons with colored backgrounds
   - Researcher, Reviewer, Citizen Scientist, Administrator

4. **Footer**
   - Links, contact info, social media

### 2. Authentication Pages

#### Login Page
**Layout:** Centered card on gradient background
**Components:**
- Logo + app name at top
- Form card with shadow
- Email input with validation
- Password input with show/hide toggle
- Remember me checkbox
- Submit button with loading state
- Forgot password link
- Sign up link

#### Register Page
**Similar layout to login with additional fields:**
- First Name, Last Name
- Email, Password, Confirm Password
- Organization (optional)
- User type selection (radio buttons)
- Terms acceptance checkbox

### 3. Dashboard Layout
**Structure:**
- Navigation bar (glass morphism effect)
- Main content area with sidebar potential
- Breadcrumb navigation
- User avatar/menu in top right

#### Dashboard Home
**Layout:** Grid-based with analytics
**Sections:**
1. **Welcome Header**
   - Personalized greeting
   - User organization info

2. **Quick Actions Grid** (2x2 or 4x1)
   - Submit Data (Indigo)
   - Explore Data (Green)
   - My Submissions (Blue)
   - Review Queue/Community (Orange/Purple)

3. **Analytics Dashboard**
   - Charts and statistics
   - Recent activity feed
   - Data submission trends

### 4. Data Submission Flow

#### Step 1: Method Selection
- Choose between form submission or file upload
- Visual cards with icons
- Progress indicator at top

#### Step 2: Data Entry
**Form Submission:**
- Multi-step form with validation
- Field groups with clear labels
- Real-time validation feedback
- Save draft functionality

**File Upload:**
- Drag-and-drop area
- File format validation
- Upload progress
- Preview of uploaded data

#### Step 3: Review & Submit
- Summary of entered data
- Validation status indicators
- Submit button with confirmation

### 5. Data Exploration

#### Browse Interface
**Layout:** Search + filters + results grid
**Components:**
- Search bar with advanced filters
- Category filters (checkboxes)
- Sort options dropdown
- Results grid with data cards
- Pagination

#### Dataset Detail View
**Layout:** Full-width with tabs
**Sections:**
- Dataset header with metadata
- Data preview table
- Download options
- Related datasets
- Comments/reviews section

### 6. Review Dashboard (Reviewers)

#### Review Queue
**Layout:** Table/list view
**Features:**
- Submission cards with preview
- Status indicators
- Assignment system
- Bulk actions

#### Review Interface
**Layout:** Split view
**Components:**
- Data preview on left
- Review form on right
- Comment system
- Approval/rejection controls

### 7. Admin Dashboard

#### System Overview
**Layout:** Metrics dashboard
**Components:**
- User statistics
- Data submission metrics
- System health indicators
- Recent activity logs

#### User Management
**Layout:** Table with actions
**Features:**
- User list with search/filter
- Role management
- Permission settings
- Bulk operations

## 🧩 Component Library

### Navigation Components

#### Main Navigation
**Design Features:**
- Glass morphism background (white/80 with backdrop blur)
- Logo with animated icon effect
- Horizontal menu items with hover states
- Theme toggle button
- User avatar dropdown
- Mobile hamburger menu

**States:**
- Default, Hover, Active, Focus
- Mobile collapsed/expanded

#### User Menu Dropdown
**Design:**
- Rounded corners (12px)
- Glass effect background
- User info header with avatar
- Menu items with icons
- Logout button in red

### Form Components

#### Input Fields
**Variants:**
- Text input
- Email input
- Password input (with show/hide)
- Textarea
- Select dropdown
- Checkbox
- Radio buttons
- File upload

**States:** Default, Focus, Error, Disabled, Success

#### Buttons
**Variants:**
- Primary (gradient indigo to purple)
- Secondary (white with border)
- Tertiary (text only)
- Destructive (red)
- Icon button

**Sizes:** Small (32px), Medium (40px), Large (48px)

### Card Components

#### Data Card
**Layout:**
- Header with title and status badge
- Preview content area
- Action buttons footer
- Hover elevation effect

#### Feature Card
**Layout:**
- Icon container with background
- Title and description
- Optional action button

#### Stats Card
**Layout:**
- Large number display
- Label and description
- Optional trend indicator
- Icon or chart

### Data Visualization

#### Charts
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Progress bars and rings

#### Data Tables
- Sortable columns
- Filterable rows
- Pagination
- Row selection
- Export functionality

### Modal Components

#### Confirmation Modal
**Layout:**
- Centered overlay
- Icon + title + message
- Action buttons (cancel/confirm)

#### Data Preview Modal
**Layout:**
- Large modal with close button
- Tabbed content
- Full data table view

## 🌙 Dark Mode Specifications

### Background System
- Primary: Linear gradient from gray-900 to gray-800
- Cards: gray-800/80 with backdrop blur
- Overlays: gray-900/90

### Interactive States
- Hover: Increase opacity/brightness by 10%
- Focus: Indigo ring with gray-900 offset
- Active: Decrease opacity by 5%

### Border System
- Light borders: white/10
- Medium borders: white/20
- Strong borders: white/30

## 📐 Layout Specifications

### Grid System
**Breakpoints:**
- Mobile: 320px - 768px (1 column)
- Tablet: 768px - 1024px (2-3 columns)
- Desktop: 1024px+ (3-4 columns)

### Container Widths
- Max width: 1280px (7xl)
- Padding: 16px mobile, 24px tablet, 32px desktop

### Component Spacing
- Card padding: 24px
- Section spacing: 64px
- Element spacing: 16px
- Form field spacing: 20px

## 🎭 Animation Specifications

### Micro-interactions
- Button hover: Transform scale(1.05) + shadow increase
- Card hover: Elevation increase (shadow)
- Icon hover: Transform scale(1.1) with rotation
- Page transitions: Fade in with slight upward movement

### Loading States
- Skeleton screens for data loading
- Spinner for actions
- Progress bars for uploads
- Shimmer effect for placeholders

### Transition Timing
- Fast: 150ms (hover states)
- Medium: 200ms (most interactions)
- Slow: 300ms (page transitions)
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

## 📊 User Flow Diagrams

### Authentication Flow
1. Landing Page → Login/Register
2. Registration → Email Verification → Dashboard
3. Login → Dashboard (with role-based redirection)

### Data Submission Flow
1. Dashboard → Submit Data
2. Choose Method → Form/Upload
3. Enter Data → Validate → Review → Submit
4. Confirmation → Track Status

### Review Flow (Reviewers)
1. Dashboard → Review Queue
2. Select Submission → Review Interface
3. Analyze Data → Add Comments → Approve/Reject
4. Notification to Submitter

## 🔧 Implementation Notes for Figma

### Auto Layout Setup
- Use auto layout for all components
- Set proper spacing and padding
- Create responsive variants

### Component Variants
- Create variants for all states (default, hover, focus, disabled)
- Use boolean properties for toggles
- Create size variants where needed

### Design Tokens
- Set up color styles for the entire palette
- Create text styles for typography scale
- Define effect styles for shadows and blurs

### Prototype Connections
- Connect all navigation links
- Add hover states to interactive elements
- Create smooth transitions between pages
- Include loading states for forms

This specification provides everything needed to create comprehensive Figma designs for your SciDataHub platform. Each screen, component, and interaction is detailed with specific measurements, colors, and behaviors. 