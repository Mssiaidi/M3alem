# Admin Dashboard Notes

This file summarizes the work done on the admin dashboard and related moderation screens.

## What changed

- The admin dashboard chart now uses real data from the backend instead of fixed placeholder bars.
- The trend indicator in the KPI cards is dynamic and changes according to the dashboard data.
- `System Alerts` are generated from live dashboard state instead of hardcoded messages.
- The chart menu actions now do real work:
  - `Refresh data` reloads dashboard data.
  - `Export report` downloads a CSV report.
  - `View analytics` opens a dedicated analytics page.
- A new admin analytics page was added at `/admin/analytics`.
- `ShopModeration` now reads shops from the database payload returned by `/admin/shops/pending`.
- `ReviewModeration` now reads reviews from the database payload returned by `/admin/reviews`.
- `CategoryManagement` now reads categories from the database payload returned by `/admin/categories`, including `products_count`.
- `UserManagement` now reads users from the database payload returned by `/admin/users`, including role-based counts and per-user activity counts.
- `UserManagement` was redesigned as a full-width account workspace with a mini create-account form, role/status filters, and approval actions for pending seller/admin accounts.
- A new `account_status` field now keeps non-client accounts pending until an admin validates them.
- `UserManagement` now opens the create-account form in a modal from the `Ajouter un compte` button instead of showing it inline.
- `UserManagement` now has a `Voir / Gérer` modal for richer account actions and details.
- Login now blocks pending seller/admin accounts with a clear validation message.
- `ReviewModeration` now reads reviews from the database payload returned by `/admin/reviews` and supports real delete moderation.
- Both moderation screens were restyled to match the same clean admin theme and responsive behavior.
- The admin dashboard, analytics page, and moderation screens now share a more unified visual language inspired by the static mockup.

## Files touched

- `Backend_M3ALAM/app/Http/Controllers/Api/Admin/DashboardController.php`
- `Backend_M3ALAM/frontend_M3ALAM/src/api/adminService.js`
- `Backend_M3ALAM/frontend_M3ALAM/src/pages/admin/AdminDashboard.jsx`
- `Backend_M3ALAM/frontend_M3ALAM/src/pages/admin/AdminAnalytics.jsx`
- `Backend_M3ALAM/frontend_M3ALAM/src/pages/admin/ShopModeration.jsx`
- `Backend_M3ALAM/frontend_M3ALAM/src/pages/admin/ReviewModeration.jsx`
- `Backend_M3ALAM/frontend_M3ALAM/src/pages/admin/CategoryManagement.jsx`
- `Backend_M3ALAM/frontend_M3ALAM/src/pages/admin/UserManagement.jsx`
- `Backend_M3ALAM/frontend_M3ALAM/src/App.jsx`
- `Backend_M3ALAM/frontend_M3ALAM/src/App.css`

## Notes

- The dashboard still falls back gracefully when trend data is unavailable.
- The CSV export is intentionally lightweight so it works without extra backend endpoints.
- The analytics page currently shows a month snapshot using the existing dashboard API response.
