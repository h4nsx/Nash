Implementation Plan: All "Missing" Client Features
Architecture & Phase Order
Decision Needed Before Execution

IMPORTANT

Milestone Budget Cap Rule (sum(milestones) vs. AgreedBudget) Currently, when a contract is activated in HandshakeService.cs, the system auto-creates Milestone 1 (InProgress) for 100% of AgreedBudget. To let Clients split a contract into multiple stages smoothly, we plan to:

Allow Clients to edit any milestone that is not yet Submitted or Accepted (so they can reduce Milestone 1 from e.g. 20,000,000 ₫ to 5,000,000 ₫ and add Milestones 2 & 3), and delete Pending milestones.
Question: Should the backend strictly block creating/updating milestones when sum(milestones) > AgreedBudget (Recommended), or allow exceeding AgreedBudget with a warning for extra/bonus scope?

NOTE

Database Migration (ClientProfiles): Adding ClientProfile introduces a new ClientProfiles table. Because this machine has the .NET runtime without the .NET SDK (dotnet ef), we will author the EF Core migration class alongside the entity configuration so you can apply it via dotnet ef database update in your .NET 8 SDK / Docker environment.

Proposed Changes by Phase
Phase 1: Client Profile (ClientProfile Entity, API & Company/Billing UI) — Covers Missing #1
[NEW] src/Domain/Entities/ClientProfile.cs: Pure 1:1 domain entity with User (CompanyName, Industry, CompanySize, WebsiteUrl, TaxCode, BillingAddress, City, Country, ContactPhone, Bio).
[MODIFY] User.cs, IAppDbContext.cs, AppDbContext.cs + [NEW] src/Infrastructure/Migrations/_\_AddClientProfile.cs: Register DbSet<ClientProfile> with 1:1 cascade relationship and unique index on UserId.
[MODIFY] IUserService.cs, UserService.cs, UsersController.cs:
GET /api/v1/users/me/client-profile ([Authorize(Roles = "Client")], auto-initializes profile on first fetch).
PUT /api/v1/users/me/client-profile ([Authorize(Roles = "Client")], updates company/tax/billing info + FirstName/LastName).
GET /api/v1/users/clients/{id} returning public company summary (PublishedProjectsCount, CompletedContractsCount).
[NEW] apps/web/pages/dashboard/client/profile.tsx + [MODIFY] Sidebar.tsx, Topbar.tsx, settings/index.tsx:
Dedicated Hồ sơ Doanh nghiệp & Thanh toán page (/dashboard/client/profile), linked from Sidebar, Topbar user pill, and Account Settings.
Phase 2: Smart Match Spec Compliance & Candidate Full-Profile Inspection — Covers Missing #2
[MODIFY] IMatchEngineService.cs & MatchEngineService.cs:
Persist and return structured ReasonCodes (required_skill, verified_skill, experience, budget_fit, availability) alongside localized Reasons, plus candidate quick stats (Headline, HourlyRate, YearsOfExperience, VerifiedSkills, JobSuccessScore).
Implement deterministic multi-level tie-breaking per matching-engine.md: Score DESC → MandatoryCoverage DESC → VerifiedCoverage DESC → IsAvailable DESC → FreelancerId ASC.
Safe recalculation: mark prior Generated/Recommended snapshots as Expired on refresh without overwriting Viewed/Dismissed records.
[MODIFY] IUserService.cs & UserService.cs:
Enrich PublicFreelancerDto with AverageRating, ReviewsCount, and recent Reviews (Rating, Comment, ReviewerName, CreatedAt).
[NEW] apps/web/components/modals/FreelancerProfileModal.tsx + [MODIFY] projects.tsx:
Full candidate inspection modal (GET /users/freelancers/{id}) displaying Bio, Verified Skills, Portfolio Items, Work Experience, Education, Certifications, Languages, and Reviews, with a "Xem hồ sơ đầy đủ" trigger on each Smart Match card and a direct "Mời hợp tác" button.
Phase 3: Contract Template Picker & Direct Invite from /freelancers — Covers Missing #3 & #4
[MODIFY] ContractTemplatesController.cs & ContractTemplateService.cs:
Allow [Authorize] on GET /api/v1/contracttemplates (returning IsActive templates for Clients; keeping POST/PUT restricted to Admin).
Auto-seed 2 default Vietnamese contract templates (Hợp đồng Khoán gọn theo Cột mốc & Hợp đồng Tư vấn theo Giờ) when none exist.
[NEW] apps/web/components/modals/OfferComposerModal.tsx + [MODIFY] projects.tsx & freelancers.tsx:
Shared Offer Composer modal supporting project selection (for /freelancers), Contract Template dropdown with placeholder substitution ({{PROJECT_TITLE}}, {{FREELANCER_NAME}}, {{BUDGET_VND}}, {{START_DATE}}, {{END_DATE}}), live HTML preview, and custom notes.
Upgrade freelancers.tsx with full FreelancerProfileModal inspection and direct "Mời tham gia dự án" action for logged-in Clients.
Phase 4: Project File Attachments Upload (IStorageService + Media API + UI) — Covers Missing #5
[NEW] src/Application/Common/Interfaces/IStorageService.cs, src/Infrastructure/Services/LocalFileStorageService.cs, src/Api/Controllers/MediaController.cs + [MODIFY] DependencyInjection.cs & Program.cs:
Implement IStorageService (wwwroot/uploads local provider, 10 MB limit, safe extension allowlist .pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg, .webp, .zip, .txt), persist MediaAsset.cs, enable app.UseStaticFiles(), and expose [Authorize] POST /api/v1/media/upload.
[MODIFY] client.ts, projects.tsx, dashboard/projects/index.tsx:
Add apiUploadFile helper (FormData), add file upload/remove controls in the Project Wizard, and render downloadable attachment links on both Client and Freelancer project views.
Phase 5: Milestone Edit/Delete, Budget Guard & Client Payment History — Covers Missing #6 & #7
[MODIFY] IWorkService.cs, WorkService.cs, WorkController.cs:
Add PUT /api/v1/work/milestones/{id} (edit non-submitted/non-accepted milestones) and DELETE /api/v1/work/milestones/{id} (delete Pending milestones), plus VND budget validation against AgreedBudget.
[MODIFY] work/index.tsx:
Add a Milestone Budget Allocation Bar (Đã phân bổ / Ngân sách hợp đồng) and Chỉnh sửa / Xóa actions on eligible milestones.
[MODIFY] IPaymentService.cs, PaymentService.cs, PaymentsController.cs:
Expose [Authorize] GET /api/v1/payments/my-transactions returning Client/Freelancer payment records.
[NEW] apps/web/pages/dashboard/client/payments.tsx + [MODIFY] Sidebar.tsx:
Dedicated Thanh toán & Biên lai page (/dashboard/client/payments) with total paid VND KPIs, status filters, and a Printable VietQR Receipt Modal.
Phase 6: Role-Based Route Guards, Automated Tests & Docs — Covers Missing #8
[MODIFY] middleware.ts & DashboardLayout.tsx:
Decode JWT role claim (base64url, zero extra packages) to protect /admin_ (Admin only), /dashboard/client/_ (Client only), and /dashboard/skills_ + /dashboard/profile\* (Freelancer only, redirecting Clients to /dashboard/client/profile).
[NEW] Unit & Controller tests in tests/UnitTests & tests/IntegrationTests covering Smart Match tie-breaking/reasons, Milestone edit/delete/budget cap, ClientProfile, ContractTemplates, MediaController, and PaymentsController.GetMyTransactions.
[MODIFY] api.md & domain-model.md.

Please confirm:

Should we strictly enforce sum(milestones) <= AgreedBudget (Recommended), or allow exceeding AgreedBudget with a warning?
Ready to approve and execute Phases 1 → 6?
