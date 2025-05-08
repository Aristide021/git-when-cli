# Contributing to Git-When CLI

Thank you for your interest in contributing! Below are guidelines for developing, testing, and releasing.

## Development & Testing

1. Fork the repository and create a new branch:
   ```bash
   git clone https://github.com/aristide021/git-when-cli.git
   cd git-when-cli
   git checkout -b feat/your-feature
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests and linters (if added):
   ```bash
   npm test
   ```
4. Make your changes, add tests, and commit with clear messages.
5. Push your branch and open a Pull Request against `main`.

## Release Process

### Prerequisites
- The repository must have an `NPM_TOKEN` secret configured in GitHub Settings > Secrets.
- You must have write access to publish new versions.

### Automated Release (GitHub Actions)
1. Go to the **Actions** tab and select the **Release** workflow.
2. Click **Run workflow**. This will:
   - Bump the patch version (`npm version patch`).
   - Commit and tag the release (e.g. `v1.0.1`).
   - Push the tags back to GitHub.
   - Install dependencies and publish to npm.

   After the workflow completes, a new package release will be available on npm.

### Manual Release (CLI)
1. Ensure your working branch is merged into `main` and up-to-date:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Bump the version:
   ```bash
   npm version patch -m "Release v%s"
   ```
3. Push commits and tags:
   ```bash
   git push origin main --tags
   ```
4. CI will run tests on push; the **Release** workflow will trigger on the new tag and publish to npm.

## Code of Conduct
Please follow standard open-source etiquette: write clear commit messages, be respectful, and include tests for new behavior.

Thank you for helping improve Git-When CLI!  
We look forward to your contributions. 