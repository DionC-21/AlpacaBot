# Contributing to AlpacaBot

Thank you for your interest in contributing to AlpacaBot! This document provides guidelines and information for contributors.

## 🤝 Ways to Contribute

- **🐛 Bug Reports**: Report issues and bugs
- **💡 Feature Requests**: Suggest new features and improvements
- **📝 Documentation**: Improve guides and documentation
- **🔧 Code Contributions**: Fix bugs and implement features
- **🧪 Testing**: Help test new features and releases
- **💬 Community Support**: Help other users in discussions

## 🚀 Getting Started

### Prerequisites

- **Node.js 16+**
- **Python 3.8+**
- **Git**
- **Alpaca Paper Trading Account** (for testing)

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/AlpacaBot.git
   cd AlpacaBot
   ```

3. **Set up upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/AlpacaBot.git
   ```

4. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Alpaca paper trading API keys
   ```

6. **Test the setup**
   ```bash
   # Run the test script
   ./test-railway-deployment.sh
   
   # Start the development server
   cd server && npm run dev
   ```

## 📋 Development Guidelines

### Code Style

#### JavaScript/TypeScript
- Use **ES6+** features
- **2 spaces** for indentation
- **Semicolons** required
- **camelCase** for variables and functions
- **PascalCase** for classes and components

#### Python
- Follow **PEP 8** style guide
- **4 spaces** for indentation
- **snake_case** for variables and functions
- **PascalCase** for classes
- Use **type hints** where appropriate

#### General
- Write **clear, descriptive comments**
- Use **meaningful variable names**
- Keep functions **small and focused**
- **DRY principle** - Don't Repeat Yourself

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new trading pattern detection"
   ```

4. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use the PR template
   - Provide clear description
   - Link related issues
   - Add screenshots if applicable

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(trading): add Ross Cameron ABCD pattern detection
fix(server): resolve WebSocket connection timeout
docs(readme): update Railway deployment instructions
test(patterns): add unit tests for pattern analyzer
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run Python tests
python -m pytest

# Run specific test files
npm test -- pattern-analyzer.test.js
python -m pytest test_trading_bot.py
```

### Writing Tests

#### JavaScript Tests
```javascript
// Use Jest for JavaScript/TypeScript testing
describe('PatternAnalyzer', () => {
  test('should detect ABCD pattern', () => {
    const analyzer = new PatternAnalyzer();
    const result = analyzer.detectABCD(mockData);
    expect(result.isValid).toBe(true);
  });
});
```

#### Python Tests
```python
# Use pytest for Python testing
def test_pattern_detection():
    analyzer = PatternAnalyzer()
    result = analyzer.detect_pattern(mock_data)
    assert result.pattern_type == 'ABCD'
    assert result.confidence > 0.8
```

### Test Coverage
- Aim for **80%+ code coverage**
- Focus on **critical trading logic**
- Test **error handling** scenarios
- Mock **external API calls**

## 📝 Documentation

### Code Documentation
- **JSDoc** for JavaScript functions
- **Docstrings** for Python functions
- **Inline comments** for complex logic
- **README updates** for new features

### User Documentation
- Update relevant **guide files**
- Add **examples** for new features
- Include **screenshots** when helpful
- Test **deployment instructions**

## 🐛 Bug Reports

When reporting bugs, please include:

### Required Information
- **AlpacaBot version**
- **Operating system**
- **Node.js and Python versions**
- **Clear description** of the issue
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Error messages/logs**
- **Screenshots** (if applicable)

### Bug Report Template
```markdown
**AlpacaBot Version:** 1.0.0
**OS:** macOS 12.6
**Node.js:** 18.12.0
**Python:** 3.10.8

**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Error Messages:**
```
Paste error messages here
```

**Additional Context:**
Any other relevant information
```

## 💡 Feature Requests

For feature requests, please provide:

- **Clear description** of the feature
- **Use case** and motivation
- **Proposed implementation** (if you have ideas)
- **Examples** from other trading platforms
- **Priority level** (nice-to-have vs critical)

## 🔐 Security Guidelines

### Security-First Development
- **Never commit secrets** (API keys, passwords)
- **Validate all inputs** from users and APIs
- **Use environment variables** for configuration
- **Follow security best practices**
- **Report security issues** privately

### Trading-Specific Security
- **Paper trading first** - Always test with paper money
- **Position limits** - Implement safeguards
- **Error handling** - Don't expose sensitive data
- **Audit logging** - Track all trading decisions

## 🏷️ Release Process

### Version Numbering
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Railway deployment tested
- [ ] Desktop build tested
- [ ] Release notes prepared

## 📞 Getting Help

### Community Support
- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Discord** - Real-time community chat (if available)

### Code Review Process
- All PRs require **at least one review**
- **Security-sensitive** changes require additional review
- **Trading logic** changes require thorough testing
- **Documentation** changes are reviewed for clarity

## 🏆 Recognition

We appreciate all contributions! Contributors will be:
- **Listed in CONTRIBUTORS.md**
- **Mentioned in release notes**
- **Given credit** in relevant documentation
- **Invited to join** the core contributor team (for significant contributions)

## 📜 Code of Conduct

### Our Standards
- **Be respectful** and inclusive
- **Constructive feedback** only
- **Focus on the code**, not the person
- **Help others learn** and grow
- **Collaborate effectively**

### Unacceptable Behavior
- Harassment or discrimination
- Personal attacks
- Spam or off-topic content
- Sharing others' private information
- Financial advice or trading recommendations

## 🚨 Trading Disclaimer

**Important**: Contributors and maintainers are not providing financial advice. This software is for educational purposes. Always:

- **Use paper trading** for development
- **Test thoroughly** before using real money
- **Understand the risks** of automated trading
- **Comply with regulations** in your jurisdiction

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to AlpacaBot! Together, we're building a powerful, secure, and accessible trading platform for everyone.** 🚀
