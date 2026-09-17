# Contributing to Bharat One 🇮🇳

Thank you for contributing to **Bharat One**! To maintain code quality and ensure a smooth CI/CD deployment pipeline, please follow these branching and contribution guidelines.

---

## 🌿 Branching Strategy

We follow a simplified Feature Branching strategy:

- **`main`**: Production branch. Code on `main` is expected to be stable and deployable. Pushes to `main` automatically trigger production deployments to Vercel.
- **`feature/<feature-name>`**: Used for developing new features (e.g. `feature/csc-locator`).
- **`fix/<bug-name>`**: Used for bug fixes and patches (e.g. `fix/profile-focus-loss`).
- **`chore/<task-name>`**: Used for maintenance, dependency updates, or setup tasks (e.g. `chore/github-actions`).

---

## 🔄 Pull Request (PR) Workflow

1. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Commit Changes**:
   Follow semantic commit messages:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `chore:` Maintenance or setup

   ```bash
   git commit -m "feat: add scheme filtering by eligibility score"
   ```

3. **Push & Open PR**:
   Push your branch to GitHub and open a Pull Request targeting `main`.
   ```bash
   git push origin feature/your-feature-name
   ```

4. **CI Checks & Preview Deployments**:
   - Opening a PR automatically triggers the **GitHub Actions CI pipeline** (linting, typechecking, build).
   - Vercel will automatically generate a **Preview Deployment URL** for testing your PR in a live environment.

5. **Merge**:
   - Once CI passes and peer review is approved, merge the PR into `main`.
   - Merges to `main` automatically deploy to Vercel Production.

---

## 🛠️ Local Development & Testing

Before opening a PR, ensure all local checks pass:

```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Build test
npm run build
```
