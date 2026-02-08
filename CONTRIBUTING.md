# Contributing to GIB-RUN

Thank you for your interest in contributing to GIB-RUN! We welcome contributions from the community.

## How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/levouinse/gib-run.git
   cd gib-run
   npm install
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for review

## Development Guidelines

### Before Implementing

Consider these points:
- Is this feature useful to other people?
- Should this be GIB-RUN's responsibility?
- Am I introducing unnecessary dependencies?
- Does the naming make sense and follow existing conventions?
- Does my code adhere to the project's coding style?
- Can backwards compatibility be preserved?

### Guiding Principles

- Keep the app simple and focused
- Avoid unnecessary dependencies
- Minimize configuration requirements
- Focus on core functionality: live reloading development server
- Consider if features could be external middleware

### Code Style

- Use tabs for indentation
- Use semicolons
- Use single quotes for strings
- Keep lines under 120 characters
- Follow existing patterns in the codebase

### Testing

**New features should come with test cases!**

Run tests before submitting:
```bash
npm test
```

This will run:
- Mocha tests
- ESLint checks
- JSHint checks

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing! 🚀
