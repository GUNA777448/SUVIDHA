# Contributing to SUVIDHA

Thank you for your interest in contributing to SUVIDHA! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/suvidha-kiosk.git
   ```
3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original/suvidha-kiosk.git
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation updates

### Development Process

1. **Keep your fork updated**

   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow coding standards
   - Add tests for new features
   - Update documentation

3. **Test your changes**

   ```bash
   npm run test
   npm run lint
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "type: description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### JavaScript/React

- Use ES6+ features
- Follow Airbnb style guide
- Use functional components with hooks
- Implement PropTypes for components
- Use meaningful variable names

### File Structure

```javascript
// Component structure
import React from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

export default ComponentName;
```

### Node.js/Express

- Use async/await for asynchronous operations
- Implement proper error handling
- Follow MVC pattern
- Add JSDoc comments for functions

### Naming Conventions

- **Files**: kebab-case (e.g., `user-service.js`)
- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Functions**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Classes**: PascalCase (e.g., `UserService`)

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(auth): add multi-factor authentication

Implemented OTP-based MFA for enhanced security

Closes #123

fix(payment): resolve razorpay integration timeout

The payment gateway was timing out due to improper error handling

test(electricity): add unit tests for bill calculation
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console.log or debugging code
- [ ] No merge conflicts

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe testing done

## Screenshots (if applicable)

## Related Issues

Closes #issue_number

## Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. Automated checks must pass
2. At least 2 approvals required
3. No unresolved conversations
4. Branch must be up-to-date with main

## 🧪 Testing Requirements

### Required Tests

1. **Unit Tests**
   - All new functions must have unit tests
   - Minimum 80% code coverage
   - Use Jest for testing

2. **Integration Tests**
   - API endpoints must have integration tests
   - Test error scenarios

3. **E2E Tests**
   - Critical user flows must have E2E tests
   - Use Playwright or Cypress

### Running Tests

```bash
# All tests
npm run test

# Specific service
cd services/auth-service && npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all functions
- Document complex logic
- Update README if adding new features

### API Documentation

- Update OpenAPI/Swagger specs
- Document request/response formats
- Include example payloads

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**

- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 90]
- Version: [e.g., 1.0.0]
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem it solves**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other solutions considered
```

## 🏆 Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation

## 📧 Contact

- Email: dev@suvidha-kiosk.gov.in
- Slack: #suvidha-dev
- Issues: GitHub Issues

---

Thank you for contributing to SUVIDHA! 🙏
