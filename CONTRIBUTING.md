# 🤝 Contributing to VoidCloud

Thank you for your interest in contributing to VoidCloud! We welcome bug fixes, performance improvements, and architectural reviews.

## Development Workflow
1. **Fork the Repository**: Clone your fork locally.
2. **Install Dependencies**: Run `npm install`.
3. **Create a Feature Branch**: `git checkout -b feature/amazing-improvement`.
4. **Follow Coding Standards**:
   - Write clean, modular TypeScript with strict type definitions.
   - Never expose cryptographic witnesses or private secrets.
   - Run tests: `npm test` and verify 100% pass rate.
   - Verify build: `npm run build`.
5. **Commit Message Conventions**: We adhere to Conventional Commits:
   - `feat(...)`: New feature or user-facing change.
   - `fix(...)`: Bug fix.
   - `docs(...)`: Documentation updates.
   - `test(...)`: Test additions or refactors.
   - `refactor(...)`: Code refactoring without behavioral change.
6. **Submit a Pull Request**: Provide a clear description of your changes and test verification results.
