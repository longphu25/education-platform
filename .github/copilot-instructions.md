## Terminal Command Guidelines

When running terminal commands in this project:
- Prefer explicit output over silent operations
- Use `--verbose` flags when available
- For long operations, set `isBackground: true`
- Break down operations into smaller steps if timeout occurs

Common commands and expected duration:
- `npm install` - 10-30 seconds
- `npm run dev` - Background process
- `npm run build` - 30-90 seconds
- `git status` - <1 second