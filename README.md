# Computer Inventory System

## 1) Project Setup (Clone -> Install)

### Prerequisites

- Node.js 20+ (recommended latest LTS)
- pnpm 10+

### Clone the repository

```bash
git clone https://github.com/heng-vicheka/computer-inventory-system.git
cd computer-inventory-system
```

### Install dependencies

```bash
pnpm install
```

`pnpm install` will also run `prepare` and install lefthook. If hooks are not installed for any reason, run:

```bash
pnpm prepare
```

## 2) Task Execution Workflow (GitHub Issue -> Branch -> Commit)

### Step 1: Start from a GitHub issue

- Pick or create a GitHub issue for the task.
- Make sure the issue clearly describes scope and acceptance criteria.

### Step 2: Create a branch from `main`

```bash
git checkout main
git pull origin main
git checkout -b <issue-number>-<short-description>
```

Example:

```bash
git checkout -b 1-environment-setup
```

### Step 3: Implement your changes

- Keep changes focused to the issue.
- Follow naming rules in section 3 below.

### Step 4: Ensure lefthook checks pass before commit

This repository enforces quality checks via lefthook.

Run pre-commit checks manually:

```bash
pnpm precommit
```

Run pre-push checks manually:

```bash
pnpm prepush
```

### Important policy

- **Do not modify `lefthook.yml`.**
- Pull Requests that change lefthook configuration will not be accepted.

You can verify this before commit:

```bash
git diff -- lefthook.yml
```

If a hook fails:

1. Fix the reported issue(s).
2. Re-run `pnpm precommit` until all checks pass.
3. Commit only after all checks are green.

### Step 5: Commit

```bash
git add .
git commit -m "feat: <short message>"
```

**Important**: commit message must include "feat: ", "fix: ", ... at the start of the commit.

```bash
Examples:

git commit -m "feat: add inventory filtering"
git commit -m "fix: fix x-function"
```

## 3) Naming Conventions

Use the following conventions consistently:

- Variable names: `camelCase`
- Constant names: `UPPERCASE_SNAKE_CASE`
- Function names: `snake_case`

Examples:

```js
const MAX_RETRY_COUNT = 3
let inventoryCount = 0

function calculate_total_items(items) {
	return items.length
}
```

## 4) Run the App

Start development server:

```bash
pnpm dev
```

Additional script available in this repository:

```bash
pnpm nodemon
```
