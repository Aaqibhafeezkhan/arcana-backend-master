# Contributing to Arcana Backend

Thank you for your interest in contributing. This document covers everything you need to get up and running, pick up an issue, and submit a pull request.

---

## Table of Contents

1. [Fork and Clone](#fork-and-clone)
2. [Local Setup](#local-setup)
3. [Branch Naming](#branch-naming)
4. [Commit Style](#commit-style)
5. [Picking Up an Issue](#picking-up-an-issue)
6. [Code Style](#code-style)
7. [Opening a Pull Request](#opening-a-pull-request)
8. [What Reviewers Look For](#what-reviewers-look-for)
9. [Code of Conduct](#code-of-conduct)
10. [Reporting Security Issues](#reporting-security-issues)

---

## Fork and Clone

```bash
# 1. Fork the repo on GitHub, then clone your fork:
git clone https://github.com/<your-username>/arcana-backend-master.git
cd arcana-backend-master

# 2. Add the upstream remote so you can pull future changes:
git remote add upstream https://github.com/ITSYABOINEUTRAL/arcana-backend-master.git
```

---

## Local Setup

You need:

- Node.js 18+
- A MongoDB instance — local (`mongodb://localhost:27017`) or a free [Atlas](https://www.mongodb.com/atlas) cluster
- A free [Cloudinary](https://cloudinary.com) account
- A free [Resend](https://resend.com) account
- A [Paystack](https://paystack.com) account — **use test keys** (`sk_test_...`) only

```bash
npm install
cp .env.example .env
# Edit .env and fill in your own values (see README for descriptions)
node server.js        # or: npx nodemon server.js
```

You should see `MongoDB connected: ...` and `Server running on port 5000` in the terminal.

**You never need the maintainer's real keys.** All services used by this project have free tiers or sandbox/test modes that work for local development.

---

## Branch Naming

Create a branch from `master` named after the type of work:

| Type | Pattern | Example |
|---|---|---|
| Bug fix | `fix/<short-description>` | `fix/address-stub-data` |
| Feature | `feat/<short-description>` | `feat/register-validation` |
| Refactor | `refactor/<short-description>` | `refactor/remove-mongodb-dep` |
| Documentation | `docs/<short-description>` | `docs/api-postman-collection` |
| Testing | `test/<short-description>` | `test/auth-smoke-tests` |
| Chore / DX | `chore/<short-description>` | `chore/npm-scripts` |

```bash
git checkout master
git pull upstream master
git checkout -b fix/address-stub-data
```

---

## Commit Style

Use the imperative mood and keep it short:

```
fix: return real addresses from GET /api/address
feat: add input validation to POST /api/auth/register
refactor: remove duplicate mongodb driver dependency
docs: add Postman collection for auth endpoints
test: smoke tests for register and login routes
chore: add start and dev npm scripts
```

One logical change per commit. Do not bundle unrelated changes.

---

## Picking Up an Issue

1. Browse [open issues](https://github.com/ITSYABOINEUTRAL/arcana-backend-master/issues).
2. **Comment on the issue** to express interest and ask any clarifying questions.
3. **Wait to be assigned** before starting work. This prevents duplicated effort.
4. Once assigned, create your branch and open a draft PR early if you want early feedback.

Issues labelled `good first issue` are specifically scoped for contributors who are new to the codebase.

---

## Code Style

- Match the patterns already present in the file you are editing.
- CommonJS (`require` / `module.exports`) throughout — do not introduce ES modules.
- Async/await for all async work (no raw `.then()` chains).
- Return early on error rather than deeply nesting the happy path.
- Do not add new dependencies without discussing it in the issue thread first.
- Do not modify files unrelated to the issue you are solving.

---

## Opening a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin fix/address-stub-data
   ```
2. Open a PR against the `master` branch of this repo.
3. Fill in the PR template completely — context, what changed, and how you tested it.
4. Link the issue your PR closes with `Closes #<issue-number>` in the description.
5. Keep the PR focused. If you notice an unrelated issue while working, open a separate issue for it rather than fixing it in the same PR.

---

## What Reviewers Look For

- The acceptance criteria in the issue are fully met.
- No regressions — existing routes and behaviour are unchanged unless the issue calls for it.
- No new dependencies introduced without prior discussion.
- Environment variables are read from `process.env`, never hardcoded.
- No secrets, real email addresses, or personal data committed.
- The code matches the existing style of the file.

---

## Code of Conduct

Be kind and constructive. Treat everyone with respect regardless of experience level, background, or identity. Disagreements about code are welcome; personal attacks are not.

For general conduct concerns or reports, open an issue or — for sensitive matters — contact the maintainer privately via the contact details on [@ITSYABOINEUTRAL's GitHub profile](https://github.com/ITSYABOINEUTRAL).

---

## Reporting Security Issues

**Please do not open public GitHub issues for security vulnerabilities.**

If you discover a security issue (missing authentication, injection vulnerability, exposed credentials, or similar), contact the maintainer privately using the contact details on [@ITSYABOINEUTRAL's GitHub profile](https://github.com/ITSYABOINEUTRAL). Please include a description of the issue and steps to reproduce it. You will receive a response as soon as possible.
