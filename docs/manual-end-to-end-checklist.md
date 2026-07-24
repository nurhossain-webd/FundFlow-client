# FundFlow manual end-to-end checklist

Last local execution: July 24, 2026

## Purpose

Use this checklist before a release to validate FundFlow's complete financial
and moderation lifecycle. Use dedicated test accounts and Stripe test mode.
Never perform this checklist against production customer data.

## Test accounts and data

Prepare three unique accounts:

- Supporter: `supporter.e2e+<timestamp>@example.com`
- Creator: `creator.e2e+<timestamp>@example.com`
- Admin: an existing seeded Admin account; Admin registration must not be
  public

Use a unique campaign title such as
`Solar Library E2E <YYYY-MM-DD HH:mm>`. Record the user IDs, campaign ID,
contribution ID, withdrawal ID, payment ID, and report ID during testing.

## Prerequisites

- Client is available at `http://localhost:3000`.
- Express API is available at the origin configured by
  `NEXT_PUBLIC_API_URL`.
- `GET /api/v1/health` returns HTTP 200 with
  `database.status: "connected"`.
- Better Auth, Google OAuth, MongoDB Atlas, imgBB, and Stripe test-mode
  variables are configured.
- Google Cloud Console contains:
  - JavaScript origin: `http://localhost:3000`
  - Redirect URI: `http://localhost:3000/api/auth/callback/google`
- A Stripe CLI listener forwards test events to:
  `POST /api/v1/payments/webhook`
- Browser DevTools is open to the Console and Network panels.
- Run the viewport checks at 375px, 768px, 1024px, and 1440px.

## Execution record

| Check                                   | Local result                   | Evidence                                                                                                      |
| --------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Client responds                         | Pass                           | `GET http://localhost:3000/` returned HTTP 200                                                                |
| API health                              | Pass                           | HTTP 200; development environment; MongoDB connected                                                          |
| Public campaigns                        | Pass                           | `GET /api/v1/campaigns?limit=1` returned HTTP 200                                                             |
| Credit packages                         | Pass                           | `GET /api/v1/payments/packages` returned HTTP 200                                                             |
| Unauthenticated role protection         | Pass                           | Supporter, Creator, and Admin dashboard APIs returned HTTP 401                                                |
| Unauthenticated notification protection | Pass                           | Notifications API returned HTTP 401                                                                           |
| Unauthenticated report protection       | Pass                           | Admin reports API returned HTTP 401                                                                           |
| Transactional financial rules           | Pass                           | Server integration suite passed registration, contribution, refund, withdrawal, payment, and ownership checks |
| Email/password browser lifecycle        | Pending manual browser session | Requires newly created disposable accounts                                                                    |
| Google browser lifecycle                | Pending external interaction   | Credentials are present; requires Google account selection and callback                                       |
| Stripe Checkout lifecycle               | Blocked by configuration       | Server Stripe secret and webhook secret are not configured locally                                            |
| Admin browser lifecycle                 | Pending manual browser session | Requires credentials for an existing Admin                                                                    |
| Responsive visual inspection            | Pending manual browser session | Requires browser viewport and interaction inspection                                                          |

## Lifecycle checklist

### 1. Register a Supporter

- [ ] Open `/register` in a private browser window.
- [ ] Enter a unique name and email, upload a valid profile image, choose
      Supporter, and use a strong password.
- [ ] Confirm the form reports invalid email, weak password, missing image,
      and missing role before submission.
- [ ] Submit once and confirm the button remains disabled while processing.
- [ ] Confirm redirection to the Supporter dashboard.
- [ ] Confirm the profile role is Supporter and the available balance is
      exactly 50 credits.
- [ ] Refresh and sign out/in again. Confirm the balance remains 50; onboarding
      must not run a second allocation.
- [ ] Attempt registration with the same email and confirm a clear
      existing-account error.

Expected server invariant: one `UserProfile` for the Better Auth user ID,
`role: "supporter"`, and `credits: 50`.

### 2. Register a Creator

- [ ] Register a second unique account with Creator selected.
- [ ] Confirm redirection to the Creator dashboard.
- [ ] Confirm the role is Creator and the starting balance is exactly 20
      credits.
- [ ] Refresh and sign out/in. Confirm the balance remains 20.
- [ ] Confirm Admin is not available in the public role selector.

Expected server invariant: one `UserProfile`, `role: "creator"`,
`credits: 20`, `raisedCredits: 0`, and `reservedRaisedCredits: 0`.

### 3. Email/password login

- [ ] Sign out and open `/login`.
- [ ] Verify incorrect credentials show a useful error without exposing
      authentication internals.
- [ ] Sign in as the Supporter and confirm routing to the Supporter dashboard.
- [ ] Repeat with the Creator and confirm routing to the Creator dashboard.
- [ ] Confirm an API token is stored only under the expected local-storage key
      and authenticated API calls contain `Authorization: Bearer <token>`.

### 4. Google login and onboarding

- [ ] Clear localhost auth cookies or use an Incognito window.
- [ ] Start Google sign-in from the Better Auth button.
- [ ] Confirm one Google account-selection request opens.
- [ ] Confirm the callback reaches
      `/api/auth/callback/google` without `invalid_code`.
- [ ] For a new Google user, confirm one role-selection screen appears.
- [ ] Select Supporter or Creator and confirm the corresponding starting
      credits are allocated once.
- [ ] Sign out and repeat Google login. Confirm onboarding does not appear
      again and no additional credits are granted.

### 5. Refresh and route persistence

- [ ] Open a nested private route directly, such as
      `/dashboard/creator/campaigns/new`.
- [ ] Refresh the browser.
- [ ] Confirm the session loading screen appears while auth resolves.
- [ ] Confirm the same URL remains open after session restoration.
- [ ] Remove or expire the API token and confirm a protected API request
      produces a controlled re-authentication flow.
- [ ] While signed out, open a private URL and confirm login receives the
      intended destination.

### 6. Creator submits a campaign

- [ ] Sign in as the Creator and open the new-campaign form.
- [ ] Verify required fields, positive values, future deadline, minimum
      contribution, upload progress, and image preview.
- [ ] Submit the unique test campaign.
- [ ] Confirm one pending campaign appears in My Campaigns with zero raised
      credits.
- [ ] Double-click or resubmit during loading and confirm no duplicate
      campaign is created.

Expected server invariant: `status: "pending"` and `amountRaised: 0`,
regardless of client payload manipulation.

### 7. Admin approves the campaign

- [ ] Sign in as Admin and open Campaign Approvals.
- [ ] Find the unique campaign and inspect its details.
- [ ] Confirm approval requires confirmation and disables repeated actions.
- [ ] Approve once.
- [ ] Confirm the campaign disappears from pending approvals.
- [ ] Attempt the approval request again and confirm it is rejected without a
      second state transition.
- [ ] Confirm the Creator receives a campaign-approved notification.

### 8. Supporter discovers the campaign

- [ ] Sign in as Supporter and open Explore Campaigns.
- [ ] Find the campaign by title and Creator.
- [ ] Exercise category, deadline, funding-goal, sort, and pagination controls.
- [ ] Confirm filters remain represented in the URL.
- [ ] Open details and verify story, reward, deadline, creator, goal, raised
      amount, and progress.

### 9. Supporter purchases credits

- [ ] Confirm all four server-defined packages appear.
- [ ] Select a Stripe test package; confirm the client sends only its package
      ID.
- [ ] Complete Checkout with Stripe test card `4242 4242 4242 4242`, a future
      expiry, any CVC, and a valid postal code.
- [ ] Confirm the success page verifies the Checkout Session through the
      server.
- [ ] Confirm credits appear only after the signed webhook succeeds.
- [ ] Replay the same webhook event and refresh the success URL. Confirm
      credits are not allocated again.
- [ ] Confirm payment history contains one completed, masked transaction.
- [ ] Repeat once using Checkout cancellation and confirm no credits are
      added.

### 10. Supporter contributes

- [ ] Note the Supporter's current balance and campaign raised amount.
- [ ] Verify amounts below the minimum, above the balance, fractional values,
      and expired campaigns are rejected.
- [ ] Submit a valid contribution and accept the confirmation.
- [ ] Confirm the balance decreases immediately by exactly the submitted
      amount.
- [ ] Confirm the contribution appears once with pending status.
- [ ] Repeat the same request using the same idempotency key and confirm there
      is no second deduction.

### 11. Creator reviews the contribution

- [ ] Confirm the Creator notification badge increases.
- [ ] Open the notification and confirm it marks as read and navigates to the
      review screen.
- [ ] Inspect the complete contribution details.
- [ ] Note the campaign amount and Creator raised credits.
- [ ] Approve with confirmation and confirm action buttons remain disabled
      during processing.
- [ ] Confirm the contribution disappears from pending review.
- [ ] Confirm campaign raised amount and Creator raised credits each increase
      exactly once.
- [ ] Repeat the approval request and confirm HTTP 409 with no balance change.
- [ ] Confirm the Supporter receives an approval notification.

Optional rejection branch:

- [ ] Create another pending contribution.
- [ ] Reject it with a meaningful reason.
- [ ] Confirm the Supporter is refunded exactly once and receives a rejection
      notification.

### 12. Creator requests a withdrawal

- [ ] Ensure the Creator has at least 200 withdrawable raised credits.
- [ ] Confirm requests below 200 and above withdrawable balance are rejected.
- [ ] Submit a valid request and verify the dollar amount uses 20 credits per
      $1.
- [ ] Confirm the requested credits become reserved and cannot be included in
      another pending request.
- [ ] Confirm the history shows a masked account number and pending status.

### 13. Admin approves the withdrawal

- [ ] Open Admin Withdrawal Requests.
- [ ] Confirm requested credits, server-calculated dollars, payout system,
      masked account, and date.
- [ ] Approve with confirmation.
- [ ] Confirm the request disappears from pending withdrawals.
- [ ] Confirm Creator `raisedCredits` and `reservedRaisedCredits` decrease
      exactly once.
- [ ] Repeat the request and confirm HTTP 409 without another deduction.
- [ ] Confirm the Creator receives a withdrawal-approved notification.

### 14. Supporter reports the campaign

- [ ] Return to campaign details as the Supporter.
- [ ] Submit a reason and meaningful explanation.
- [ ] Confirm one report is created.
- [ ] Attempt a second unresolved report for the same campaign and confirm it
      is rejected.
- [ ] Confirm Creator and Admin accounts cannot use the Supporter report
      endpoint.

### 15. Admin resolves the report

- [ ] Open Admin Reports and find the unique campaign report.
- [ ] Inspect reporter, campaign, creator, reason, details, and date.
- [ ] Resolve with an optional resolution note.
- [ ] Confirm the report disappears from the active filter or displays
      resolved status.
- [ ] Confirm the reporter receives a resolution notification.
- [ ] Attempt to resolve it again and confirm no duplicate resolution occurs.

Optional moderation branch:

- [ ] Submit another report for a different campaign.
- [ ] Suspend the campaign and confirm it disappears from public exploration.
- [ ] If deleting, confirm the destructive warning and verify all pending and
      approved contributions are refunded transactionally.

## Role and ownership matrix

- [ ] Signed-out users receive 401 from protected APIs.
- [ ] Supporter cannot create, approve, update, or delete campaigns.
- [ ] Supporter cannot approve contributions or withdrawals.
- [ ] Creator cannot contribute or report campaigns.
- [ ] Creator cannot access another Creator's campaign or contribution.
- [ ] Creator cannot approve campaigns or withdrawals.
- [ ] Admin cannot contribute and cannot register publicly.
- [ ] Users cannot read or mark another user's notifications.
- [ ] Suspended users receive 403 from protected actions.
- [ ] Client-supplied email, role, credits, prices, raised amount, and payment
      status do not affect authorization or financial calculations.

## Responsive and accessibility matrix

Repeat the public navbar, campaign exploration/details, authentication forms,
each role dashboard, tables/cards, dialogs, and notification center at:

- [ ] 375px mobile
- [ ] 768px tablet
- [ ] 1024px small desktop
- [ ] 1440px desktop

At each size confirm:

- [ ] No horizontal page scrolling.
- [ ] Navigation does not wrap or obscure controls.
- [ ] Dashboard drawer/sidebar remains usable.
- [ ] Tables switch to usable scrolling or mobile cards.
- [ ] Dialogs stay inside the viewport and scroll internally.
- [ ] Charts fit their containers.
- [ ] Notification popup remains fully visible.
- [ ] Buttons meet touch-target expectations and disabled states are clear.
- [ ] Forms retain visible labels, errors, and focus indicators.
- [ ] Keyboard navigation, Escape-to-close, and focus restoration work.
- [ ] Reduced-motion preference disables nonessential slider/chart animation.

## Cleanup

- [ ] Delete or clearly label all E2E campaigns and reports.
- [ ] Do not delete financial audit records directly.
- [ ] Remove disposable Better Auth and platform accounts only through the
      documented safe user-management process.
- [ ] Stop the Stripe CLI listener.
- [ ] Record any failed step with URL, role, timestamp, expected result,
      observed result, response status, and sanitized console/network evidence.
