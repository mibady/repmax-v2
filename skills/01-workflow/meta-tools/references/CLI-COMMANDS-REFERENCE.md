# AI Coder CLI Commands Reference

**Version:** 1.0
**Last Updated:** 2025-10-25
**Status:** Production Reference

---

## Table of Contents

1. [WSL Commands](#wsl-commands)
2. [AI Coder CLI](#ai-coder-cli)
3. [Node.js & NPM](#nodejs--npm)
4. [Git Commands](#git-commands)
5. [Code Review (CodeRabbit)](#code-review-coderabbit)
6. [Next.js](#nextjs)
7. [TypeScript](#typescript)
8. [Database (Supabase)](#database-supabase)
9. [Redis (Upstash)](#redis-upstash)
10. [Stripe CLI](#stripe-cli)
11. [Vercel CLI](#vercel-cli)
12. [Docker](#docker)
13. [MCP Server](#mcp-server)
14. [Testing](#testing)
15. [Linting & Formatting](#linting--formatting)
16. [Package Management](#package-management)
17. [Project Scaffolding](#project-scaffolding)
18. [Environment Management](#environment-management)
19. [Monitoring & Debugging](#monitoring--debugging)
20. [CI/CD](#cicd)
21. [E2B CLI](#e2b-cli)

---

## WSL Commands

### Basic WSL Operations

```bash
# Check WSL version
wsl --version

# List installed distributions
wsl --list --verbose
wsl -l -v

# Set default distribution
wsl --set-default Ubuntu

# Shutdown WSL
wsl --shutdown

# Restart a specific distribution
wsl --terminate Ubuntu

# Update WSL
wsl --update

# Check WSL status
wsl --status
```

### File System Navigation

```bash
# Access Windows files from WSL
cd /mnt/c/Users/YourUsername/Documents

# Access WSL files from Windows (in File Explorer)
\\wsl$\Ubuntu\home\username

# Convert WSL path to Windows path
wslpath -w /home/username/project
# Output: \\wsl$\Ubuntu\home\username\project

# Convert Windows path to WSL path
wslpath -u 'C:\Users\Username\Documents'
# Output: /mnt/c/Users/Username/Documents
```

### WSL File Operations

```bash
# Copy from Windows to WSL
cp /mnt/c/Users/Username/file.txt ~/

# Copy from WSL to Windows
cp ~/file.txt /mnt/c/Users/Username/

# Create symbolic link to Windows folder
ln -s /mnt/c/dev ~/windows-dev

# Check disk usage
df -h

# Check specific directory size
du -sh /home/username/project
```

### WSL Process Management

```bash
# View running processes
ps aux

# Kill process by PID
kill <PID>
kill -9 <PID>  # Force kill

# Kill process by name
pkill node
pkill -9 node  # Force kill

# View process tree
pstree

# Monitor processes
htop  # Install: sudo apt install htop
top
```

### WSL Networking

```bash
# Check IP address
ip addr show
hostname -I

# Test network connectivity
ping google.com

# Check open ports
sudo netstat -tulpn
sudo lsof -i :3000  # Check specific port

# View network statistics
netstat -s
```

### WSL System Information

```bash
# Check Ubuntu version
lsb_release -a

# Check kernel version
uname -a

# Check system resources
free -h        # Memory
df -h          # Disk space
lscpu          # CPU info
```

---

## AI Coder CLI

### ⚠️ When to Use CLI vs Session Files

**CRITICAL: Session Memory First Principle**

When listing projects or loading context, **ALWAYS** follow this hierarchy:

1. **PRIMARY SOURCE**: Session Files (`.ai-coder/sessions/*.md`)
   - Most up-to-date project context
   - Contains recent work, progress, decisions
   - Human-verified summaries
   - **Use For**: Understanding project status, recent activity, completeness

2. **SECONDARY SOURCE**: Project Directories
   - Physical file system scan
   - Shows actual project locations
   - Directory modification timestamps
   - **Use For**: Validating project existence, finding new projects

3. **TERTIARY SOURCE**: CLI Tool (`ai-coder list`)
   - Metadata-dependent automated scan
   - Can miss projects without `.ai-coder/` directory
   - Limited context and details
   - **Use For**: Validation only, NOT primary source

**Example Workflow:**
```bash
# ✅ CORRECT: Session Memory First
ls -lht .ai-coder/sessions/*.md | head -10        # Step 1: Check sessions
cat .ai-coder/sessions/[recent-file].md           # Step 2: Read context
find /ai-coder-workspace -type d -name "projects" # Step 3: List directories
npm run ai-coder list                             # Step 4: Validate with CLI

# ❌ WRONG: CLI-First (incomplete, inaccurate)
npm run ai-coder list
```

**See:** `docs/guardrails/SESSION-MEMORY-FIRST.md` for complete process.

---

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ai-coder.git
cd ai-coder

# Install dependencies
npm install

# Build
npm run build

# Link globally (optional)
npm link
```

### Core Commands

```bash
# Import existing project
ai-coder import <project-path>
ai-coder import /path/to/project --name my-project
ai-coder import /path/to/project --no-rag  # Skip RAG indexing
ai-coder import /path/to/project --analyze-only  # Only analyze

# List all projects
ai-coder list
ai-coder list --verbose  # Show detailed information
ai-coder list --status active  # Filter by status (active, idle, archived)
ai-coder list --json  # Output as JSON

# Find all projects with .ai-coder directory
ai-coder find-projects
ai-coder find-projects --verbose  # Show subdirectories
ai-coder find-projects --path /custom/path  # Search custom path
ai-coder find-projects --json  # Output as JSON

# Query knowledge base
ai-coder query "How do I implement authentication?"
ai-coder query "What templates support Stripe?" --limit 10
ai-coder query "RAG setup" --context "Using Supabase"

# Validate environment and services
ai-coder validate
ai-coder validate --quick  # Quick validation (critical services only)

# Show knowledge base info
ai-coder info

# Update knowledge base
ai-coder update
```

### MCP Server Commands

```bash
# Start MCP server
npm run mcp:start

# Start in development mode
npm run mcp:dev

# Test MCP server
npm run mcp:test

# Build MCP server
npm run mcp:build
```

### Knowledge Base Commands

```bash
# Update knowledge base (full rebuild)
ai-coder update

# Query knowledge base
ai-coder query "How do I implement RAG?"
ai-coder query "What templates are available?" --limit 5
ai-coder query "Authentication patterns" --context "Using Clerk"

# Check knowledge base stats
ai-coder info

# Import project and index into knowledge base
ai-coder import /path/to/project
ai-coder import /path/to/project --no-prp  # Skip PRP generation
```

---

## Node.js & NPM

### Package Management

```bash
# Install dependencies
npm install
npm i

# Install specific package
npm install <package>
npm install <package>@<version>

# Install as dev dependency
npm install --save-dev <package>
npm i -D <package>

# Install globally
npm install -g <package>

# Update packages
npm update
npm update <package>

# Remove package
npm uninstall <package>
npm un <package>

# List installed packages
npm list
npm list --depth=0  # Top-level only
npm list -g --depth=0  # Global packages

# Check outdated packages
npm outdated

# Audit for vulnerabilities
npm audit
npm audit fix
npm audit fix --force
```

### Package Info

```bash
# View package details
npm view <package>
npm info <package>

# View package versions
npm view <package> versions

# Check package size
npm view <package> dist.tarball

# Search packages
npm search <query>
```

### NPM Scripts

```bash
# Run script from package.json
npm run <script-name>

# Common scripts
npm run dev        # Development server
npm run build      # Production build
npm run start      # Start production server
npm run test       # Run tests
npm run lint       # Run linter
npm run format     # Format code

# View available scripts
npm run
```

### NPX (Run packages without installing)

```bash
# Run create-next-app
npx create-next-app@latest

# Run TypeScript compiler
npx tsc

# Run Prettier
npx prettier --write .

# Run ESLint
npx eslint .

# Run Sentry wizard
npx @sentry/wizard@latest -i nextjs
```

---

## Git Commands

### Basic Operations

```bash
# Initialize repository
git init

# Clone repository
git clone <url>
git clone <url> <directory>

# Check status
git status
git status -s  # Short format

# Add files
git add <file>
git add .  # All files
git add -A  # All files including deletions
git add -p  # Interactive staging

# Commit
git commit -m "message"
git commit -am "message"  # Add and commit
git commit --amend  # Amend last commit
git commit --amend --no-edit  # Amend without changing message

# Push
git push
git push origin main
git push -u origin main  # Set upstream
git push --force  # Force push (dangerous!)
git push --force-with-lease  # Safer force push

# Pull
git pull
git pull origin main
git pull --rebase  # Rebase instead of merge

# Fetch
git fetch
git fetch origin
git fetch --all  # All remotes
```

### Branching

```bash
# List branches
git branch
git branch -a  # Include remote branches
git branch -r  # Remote branches only

# Create branch
git branch <branch-name>
git checkout -b <branch-name>  # Create and switch
git switch -c <branch-name>  # Modern syntax

# Switch branch
git checkout <branch-name>
git switch <branch-name>  # Modern syntax

# Delete branch
git branch -d <branch-name>  # Safe delete
git branch -D <branch-name>  # Force delete

# Rename branch
git branch -m <old-name> <new-name>
git branch -m <new-name>  # Rename current branch

# Merge branch
git merge <branch-name>
git merge --no-ff <branch-name>  # No fast-forward

# Rebase
git rebase main
git rebase -i HEAD~3  # Interactive rebase last 3 commits
```

### History & Inspection

```bash
# View log
git log
git log --oneline
git log --graph --oneline --all
git log --author="name"
git log --since="2 weeks ago"
git log -p  # Show diffs
git log --stat  # Show stats

# View specific commit
git show <commit-hash>
git show HEAD
git show HEAD~1  # One commit before HEAD

# View file history
git log -- <file>
git log -p -- <file>  # With diffs

# Blame (who changed what)
git blame <file>
git blame -L 10,20 <file>  # Lines 10-20

# Diff
git diff
git diff --staged  # Staged changes
git diff <branch1> <branch2>
git diff HEAD~1 HEAD  # Last commit
```

### Undoing Changes

```bash
# Discard changes in working directory
git restore <file>
git checkout -- <file>  # Old syntax

# Unstage file
git restore --staged <file>
git reset HEAD <file>  # Old syntax

# Reset to commit
git reset <commit>  # Keep changes
git reset --soft <commit>  # Keep changes staged
git reset --hard <commit>  # Discard all changes (dangerous!)

# Revert commit (creates new commit)
git revert <commit>

# Clean untracked files
git clean -n  # Dry run
git clean -f  # Remove files
git clean -fd  # Remove files and directories
```

### Stashing

```bash
# Stash changes
git stash
git stash save "message"
git stash -u  # Include untracked files

# List stashes
git stash list

# Apply stash
git stash apply
git stash apply stash@{0}

# Pop stash (apply and remove)
git stash pop

# Drop stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

### Remote Operations

```bash
# Add remote
git remote add origin <url>

# View remotes
git remote -v

# Remove remote
git remote remove origin

# Rename remote
git remote rename origin upstream

# Update remote URL
git remote set-url origin <new-url>

# Prune deleted remote branches
git remote prune origin
git fetch --prune
```

### Tags

```bash
# List tags
git tag

# Create tag
git tag v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"

# Push tag
git push origin v1.0.0
git push --tags  # All tags

# Delete tag
git tag -d v1.0.0  # Local
git push origin :refs/tags/v1.0.0  # Remote
```

### Git Configuration

```bash
# View config
git config --list
git config --global --list

# Set user info
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch
git config --global init.defaultBranch main

# Set editor
git config --global core.editor "code --wait"

# Set aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status

# Cache credentials
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=3600'
```

---

## Code Review (CodeRabbit)

### Installation

```bash
# Install CodeRabbit CLI
npm install -g @coderabbitai/cli

# Login
coderabbit auth login

# Check authentication status
coderabbit auth status

# Logout
coderabbit auth logout
```

### Review Commands

```bash
# Review current changes
coderabbit review

# Review specific files
coderabbit review src/**/*.ts

# Review with specific profile
coderabbit review --profile chill
coderabbit review --profile assertive
coderabbit review --profile pythonic

# Review specific commit
coderabbit review <commit-hash>

# Review pull request
coderabbit review pr <pr-number>

# Review and auto-fix
coderabbit review --fix

# Review with custom rules
coderabbit review --rules .coderabbit.yaml
```

### Configuration

```bash
# Initialize CodeRabbit config
coderabbit init

# Validate configuration
coderabbit config validate

# View current configuration
coderabbit config show
```

### CI/CD Integration

```bash
# Run in CI mode (exit with error on blockers)
coderabbit review --ci

# Generate report
coderabbit review --format json > report.json
coderabbit review --format markdown > report.md
```

---

## Next.js

### Project Creation

```bash
# Create new Next.js app
npx create-next-app@latest
npx create-next-app@latest my-app
npx create-next-app@latest --typescript
npx create-next-app@latest --app  # App Router (default in v13+)
npx create-next-app@latest --src-dir --import-alias "@/*"
```

### Development

```bash
# Start development server
npm run dev
npm run dev -- -p 3001  # Custom port

# Build for production
npm run build

# Start production server
npm start
npm start -- -p 3001  # Custom port

# Export static site
npm run build
npm run export  # Or next export
```

### Next.js CLI

```bash
# Run Next.js directly
npx next dev
npx next build
npx next start
npx next export
npx next lint

# Info about Next.js installation
npx next info

# Telemetry
npx next telemetry status
npx next telemetry disable
npx next telemetry enable
```

---

## TypeScript

### Compilation

```bash
# Compile TypeScript
npx tsc

# Watch mode
npx tsc --watch
npx tsc -w

# Check without emitting
npx tsc --noEmit

# Specific file
npx tsc src/index.ts

# With custom config
npx tsc --project tsconfig.build.json
```

### Type Checking

```bash
# Type check entire project
npx tsc --noEmit

# Type check specific files
npx tsc --noEmit src/**/*.ts

# Generate declaration files
npx tsc --declaration
npx tsc --emitDeclarationOnly
```

### TSX (TypeScript Execute)

```bash
# Run TypeScript file directly
npx tsx src/script.ts

# Watch and re-run on changes
npx tsx watch src/script.ts

# With environment variables
NODE_ENV=production npx tsx src/script.ts
```

---

## Database (Supabase)

### Supabase CLI

```bash
# Install
npm install -g supabase

# Login
supabase login

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref <project-id>

# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Check status
supabase status
```

### Migrations

```bash
# Create new migration
supabase migration new <migration-name>

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Generate types from database
supabase gen types typescript --local > types/database.ts
supabase gen types typescript --project-id <project-id> > types/database.ts
```

### Database Operations

```bash
# Run SQL query
supabase db query "SELECT * FROM users LIMIT 10"

# Dump database
supabase db dump -f dump.sql

# Restore database
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres < dump.sql

# View database logs
supabase db logs
```

### Functions

```bash
# Create new function
supabase functions new <function-name>

# Deploy function
supabase functions deploy <function-name>

# Invoke function
supabase functions invoke <function-name> --data '{"key":"value"}'

# View function logs
supabase functions logs <function-name>
```

---

## Redis (Upstash)

### Upstash CLI

```bash
# Install
npm install -g @upstash/cli

# Login
upstash auth login

# List databases
upstash redis list

# Create database
upstash redis create <name> --region us-east-1

# Delete database
upstash redis delete <database-id>

# Get database info
upstash redis get <database-id>
```

### Redis Commands (via redis-cli or code)

```bash
# Connect to Redis (if using redis-cli)
redis-cli -h <host> -p <port> -a <password>

# Set key
SET key value

# Get key
GET key

# Delete key
DEL key

# Check if key exists
EXISTS key

# Set with expiration
SETEX key 3600 value  # 3600 seconds

# Get all keys
KEYS *

# Flush database
FLUSHDB
```

---

## Stripe CLI

### Installation

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows (via WSL)
Use Linux instructions above
```

### Authentication

```bash
# Login
stripe login

# Set API key manually
stripe config --set api_key sk_test_xxx
```

### Webhooks

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Forward specific events
stripe listen --events payment_intent.succeeded,customer.created --forward-to localhost:3000/api/webhooks/stripe

# Get webhook secret
stripe listen --print-secret
```

### Testing

```bash
# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger payment_intent.succeeded

# Create test customer
stripe customers create --email test@example.com

# Create test payment
stripe payment_intents create --amount 1000 --currency usd

# List resources
stripe customers list
stripe subscriptions list
stripe invoices list
```

### Logs

```bash
# View API logs
stripe logs tail

# Filter logs
stripe logs tail --filter-source api
stripe logs tail --filter-status success
```

---

## Vercel CLI

### Installation

```bash
# Install
npm install -g vercel

# Login
vercel login

# Logout
vercel logout
```

### Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with custom name
vercel --name my-project

# Deploy specific directory
vercel path/to/directory
```

### Project Management

```bash
# Link local project to Vercel
vercel link

# Pull environment variables
vercel env pull
vercel env pull .env.local

# Add environment variable
vercel env add

# List environments
vercel env ls

# Remove environment variable
vercel env rm <variable-name>
```

### Domains

```bash
# List domains
vercel domains ls

# Add domain
vercel domains add example.com

# Remove domain
vercel domains rm example.com

# Inspect domain
vercel domains inspect example.com
```

### Logs

```bash
# View deployment logs
vercel logs <deployment-url>

# Follow logs
vercel logs --follow

# Filter logs
vercel logs --since 1h
```

### Other Commands

```bash
# List deployments
vercel list
vercel ls

# Remove deployment
vercel remove <deployment-url>

# Inspect deployment
vercel inspect <deployment-url>

# Get project info
vercel project ls
vercel project add <project-name>
vercel project rm <project-name>
```

---

## Docker

### Basic Commands

```bash
# Build image
docker build -t my-app .
docker build -t my-app:v1.0 .

# Run container
docker run my-app
docker run -d my-app  # Detached mode
docker run -p 3000:3000 my-app  # Port mapping
docker run -e NODE_ENV=production my-app  # Environment variable
docker run --name my-container my-app  # Custom name

# List containers
docker ps  # Running containers
docker ps -a  # All containers

# Stop container
docker stop <container-id>
docker stop my-container

# Start container
docker start <container-id>

# Remove container
docker rm <container-id>
docker rm -f <container-id>  # Force remove

# View logs
docker logs <container-id>
docker logs -f <container-id>  # Follow logs

# Execute command in container
docker exec -it <container-id> sh
docker exec -it <container-id> bash
```

### Images

```bash
# List images
docker images
docker image ls

# Remove image
docker rmi <image-id>
docker rmi my-app:v1.0

# Pull image
docker pull node:20-alpine

# Push image
docker push username/my-app:v1.0

# Tag image
docker tag my-app:latest my-app:v1.0

# Prune unused images
docker image prune
docker image prune -a  # Remove all unused images
```

### Docker Compose

```bash
# Start services
docker-compose up
docker-compose up -d  # Detached mode

# Stop services
docker-compose down
docker-compose down -v  # Remove volumes

# View logs
docker-compose logs
docker-compose logs -f  # Follow logs
docker-compose logs service-name  # Specific service

# Rebuild services
docker-compose build
docker-compose up --build

# Scale services
docker-compose up --scale web=3

# Execute command
docker-compose exec web sh
docker-compose exec web npm run migrate
```

### System

```bash
# View disk usage
docker system df

# Prune system
docker system prune  # Remove unused data
docker system prune -a  # Remove all unused data
docker system prune --volumes  # Include volumes

# View system info
docker info

# View version
docker version
```

---

## MCP Server

### Development

```bash
# Start MCP server (development)
npm run mcp:dev

# Start MCP server (production)
npm run mcp:start

# Build MCP server
npm run mcp:build

# Test MCP server
npm run mcp:test
```

### Custom MCP Commands

```bash
# Start wrapper server
cd scaffolds/mcp-wrapper-server
npm install
npm run build
npm start

# Test MCP tools
node dist/test-tools.js

# Health check
curl http://localhost:3000/health
```

---

## Testing

### Jest

```bash
# Run all tests
npm test
npm run test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test -- path/to/test.ts

# Update snapshots
npm test -- -u
npm test -- --updateSnapshot

# Verbose output
npm test -- --verbose

# Run tests matching pattern
npm test -- --testNamePattern="should login"
```

### Playwright (E2E)

```bash
# Install Playwright
npx playwright install

# Run E2E tests
npx playwright test

# Run specific test
npx playwright test tests/login.spec.ts

# Run in UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Run specific browser
npx playwright test --project=chromium

# Show report
npx playwright show-report

# Generate code
npx playwright codegen
```

---

## Linting & Formatting

### ESLint

```bash
# Run ESLint
npm run lint
npx eslint .

# Fix auto-fixable issues
npm run lint -- --fix
npx eslint . --fix

# Specific files
npx eslint src/**/*.ts

# Cache results
npx eslint . --cache

# Report format
npx eslint . --format stylish
npx eslint . --format json > eslint-report.json
```

### Prettier

```bash
# Check formatting
npx prettier --check .

# Format files
npx prettier --write .

# Specific files
npx prettier --write "src/**/*.{ts,tsx,json}"

# Check specific file
npx prettier --check src/index.ts

# List files that would be formatted
npx prettier --list-different .
```

### Husky (Git Hooks)

```bash
# Install Husky
npx husky-init && npm install

# Install Husky (manual)
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"

# Add pre-push hook
npx husky add .husky/pre-push "npm run build"

# Skip hooks (temporary)
git commit --no-verify
git push --no-verify
```

---

## Package Management

### NPM vs PNPM vs Yarn

```bash
# NPM
npm install
npm run dev
npm run build

# PNPM (faster, saves disk space)
pnpm install
pnpm dev
pnpm build

# Yarn
yarn
yarn dev
yarn build
```

### PNPM Specific

```bash
# Install PNPM
npm install -g pnpm

# Install dependencies
pnpm install
pnpm i

# Add package
pnpm add <package>
pnpm add -D <package>  # Dev dependency

# Remove package
pnpm remove <package>

# Update packages
pnpm update
pnpm update <package>

# Run script
pnpm <script-name>
pnpm dev

# Execute package
pnpm dlx <package>  # Like npx

# Workspace commands
pnpm -r <command>  # Run in all packages
pnpm --filter <package-name> <command>
```

---

## Project Scaffolding

### AI Coder Scaffolding

```bash
# Scaffold from template
ai-coder scaffold --template agent-saas --name my-project
ai-coder scaffold --template agent-chat --name chat-app
ai-coder scaffold --template rag-app --name knowledge-base

# List available templates
ai-coder templates list

# Custom scaffold script
./scripts/scaffold-agent-chat-e2b.sh my-project
```

### Create Commands

```bash
# Create Next.js app
npx create-next-app@latest

# Create React app
npx create-react-app my-app

# Create Vite app
npm create vite@latest

# Create Expo app
npx create-expo-app my-app

# Create T3 app (Next.js + TypeScript + tRPC)
npm create t3-app@latest
```

---

## Environment Management

### NVM (Node Version Manager)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# List available Node versions
nvm ls-remote

# Install Node version
nvm install 20
nvm install --lts

# Use Node version
nvm use 20
nvm use --lts

# Set default version
nvm alias default 20

# List installed versions
nvm ls

# Current version
nvm current
```

### Environment Variables

```bash
# View environment variables
printenv
env

# View specific variable
echo $NODE_ENV
echo $PATH

# Set temporary variable
export NODE_ENV=production
export API_KEY=your-key

# Set for single command
NODE_ENV=production npm run build

# Load .env file (if using dotenv)
export $(cat .env | xargs)
```

---

## Monitoring & Debugging

### Process Monitoring

```bash
# Monitor Node.js process
node --inspect dist/index.js

# PM2 (Process Manager)
npm install -g pm2

pm2 start dist/index.js --name my-app
pm2 list
pm2 logs my-app
pm2 stop my-app
pm2 restart my-app
pm2 delete my-app
pm2 monit  # Monitor CPU/Memory
```

### Performance

```bash
# Node.js memory usage
node --max-old-space-size=4096 dist/index.js

# Profile heap usage
node --prof dist/index.js
node --prof-process isolate-*.log > profile.txt

# Inspect heap snapshot
node --inspect-brk dist/index.js
# Then open chrome://inspect in Chrome
```

### Logs

```bash
# Tail logs
tail -f logs/app.log
tail -n 100 logs/app.log  # Last 100 lines

# Search logs
grep "ERROR" logs/app.log
grep -i "error" logs/app.log  # Case insensitive

# Watch file for changes
watch -n 1 cat logs/app.log
```

---

## E2B CLI

### Installation

```bash
# Install E2B CLI globally
npm install -g @e2b/cli

# Check version
e2b --version

# Get help
e2b --help
e2b <command> --help
```

### Authentication

```bash
# Login to E2B
e2b auth login

# Set API key manually
e2b auth set <api-key>

# Check authentication status
e2b auth status

# Logout
e2b auth logout
```

### Sandbox Management

```bash
# List available sandbox templates
e2b template list
e2b template ls

# Get template details
e2b template info <template-id>

# Create custom sandbox template
e2b template init
e2b template init --name my-sandbox

# Build sandbox template
e2b template build

# Deploy sandbox template
e2b template deploy

# Delete sandbox template
e2b template delete <template-id>
```

### Sandbox Operations

```bash
# Start a new sandbox
e2b sandbox start
e2b sandbox start <template-id>

# List running sandboxes
e2b sandbox list
e2b sandbox ls

# Stop sandbox
e2b sandbox stop <sandbox-id>

# Kill sandbox (force stop)
e2b sandbox kill <sandbox-id>

# Get sandbox logs
e2b sandbox logs <sandbox-id>
e2b sandbox logs <sandbox-id> --follow

# Execute command in sandbox
e2b sandbox exec <sandbox-id> "npm install"
e2b sandbox exec <sandbox-id> "python script.py"
```

### Development

```bash
# Initialize E2B project
e2b init

# Start sandbox in development mode
e2b dev

# Watch and rebuild template
e2b template watch

# Test sandbox locally
e2b sandbox test
```

### File Operations

```bash
# Upload file to sandbox
e2b sandbox upload <sandbox-id> <local-path> <remote-path>

# Download file from sandbox
e2b sandbox download <sandbox-id> <remote-path> <local-path>

# Sync directory to sandbox
e2b sandbox sync <sandbox-id> <local-dir> <remote-dir>
```

### Environment Variables

```bash
# Set environment variable
e2b env set KEY=value

# List environment variables
e2b env list
e2b env ls

# Remove environment variable
e2b env remove KEY
e2b env rm KEY
```

### Configuration

```bash
# Show current configuration
e2b config show

# Set configuration value
e2b config set <key> <value>

# Get configuration value
e2b config get <key>
```

### Usage & Billing

```bash
# Check usage statistics
e2b usage

# View billing information
e2b billing

# View API key usage
e2b api-keys list
```

---

## CI/CD

### GitHub Actions

```bash
# Validate workflow
gh workflow list
gh workflow view <workflow-name>

# Trigger workflow
gh workflow run <workflow-name>

# View workflow runs
gh run list
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

### Deploy Commands

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy
netlify deploy --prod

# Railway
railway up

# Fly.io
fly deploy

# Heroku
git push heroku main
heroku logs --tail
```

---

## Quick Reference: Most Common Commands

### Daily Development

```bash
# Start development
npm run dev

# Check git status
git status

# Create feature branch
git checkout -b feature/my-feature

# Run tests
npm test

# Run linter
npm run lint

# Format code
npx prettier --write .

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Review code
coderabbit review

# Deploy
vercel --prod
```

### Troubleshooting

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Check port usage
sudo lsof -i :3000
sudo kill -9 <PID>

# Check disk space
df -h

# Check memory usage
free -h

# View system logs
journalctl -xe

# Check environment
node --version
npm --version
git --version
```

---

## Aliases (Add to ~/.bashrc or ~/.zshrc)

```bash
# Navigation
alias ..="cd .."
alias ...="cd ../.."
alias dev="cd /mnt/c/dev"
alias projects="cd ~/projects"

# Git
alias gs="git status"
alias ga="git add"
alias gc="git commit -m"
alias gp="git push"
alias gpl="git pull"
alias gco="git checkout"
alias gb="git branch"
alias gl="git log --oneline --graph"

# NPM
alias ni="npm install"
alias nid="npm install --save-dev"
alias nr="npm run"
alias nrd="npm run dev"
alias nrb="npm run build"

# Docker
alias d="docker"
alias dc="docker-compose"
alias dcu="docker-compose up"
alias dcd="docker-compose down"

# Utilities
alias cls="clear"
alias ll="ls -la"
alias ports="sudo netstat -tulpn"
```

---

## Summary

This reference covers:
- ✅ WSL commands for Windows/Linux integration
- ✅ AI Coder CLI for framework operations
- ✅ Node.js & NPM for package management
- ✅ Git for version control
- ✅ CodeRabbit for code review
- ✅ Next.js for development
- ✅ TypeScript compilation
- ✅ Supabase for database
- ✅ Stripe CLI for payments
- ✅ Vercel CLI for deployment
- ✅ Docker for containerization
- ✅ Testing frameworks
- ✅ Linting & formatting
- ✅ Environment management
- ✅ Monitoring & debugging
- ✅ CI/CD operations
- ✅ E2B CLI for code execution sandboxes

**Pro Tip:** Bookmark this page and use `Ctrl+F` to quickly find commands!

---

**Last Updated:** 2025-10-25
**Maintained By:** AI Coder Team
