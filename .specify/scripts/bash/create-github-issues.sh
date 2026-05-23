#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# create-github-issues.sh
# ==============================================================================
# Creates GitHub issues from tasks.md in a feature specification directory.
# Each task becomes an issue with appropriate labels and metadata.
#
# Usage:
#   ./create-github-issues.sh [feature-dir] [--dry-run]
#
# Example:
#   ./create-github-issues.sh specs/001-pickup-notification-service
#   ./create-github-issues.sh specs/001-pickup-notification-service --dry-run
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated
#   - tasks.md exists in the feature directory
#   - Repository is a git repository
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
FEATURE_DIR="${1:-}"
DRY_RUN=false

if [[ "${2:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

# Function to print colored output
log_info() {
  echo -e "${BLUE}INFO:${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}WARNING:${NC} $1"
}

log_error() {
  echo -e "${RED}ERROR:${NC} $1"
}

# Validate prerequisites
if ! command -v gh &> /dev/null; then
  log_error "GitHub CLI (gh) is not installed. Install from https://cli.github.com"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  log_error "GitHub CLI is not authenticated. Run: gh auth login"
  exit 1
fi

# Validate feature directory
if [[ -z "$FEATURE_DIR" ]]; then
  log_error "Usage: $0 <feature-dir> [--dry-run]"
  log_error "Example: $0 specs/001-pickup-notification-service"
  exit 1
fi

if [[ ! -d "$REPO_ROOT/$FEATURE_DIR" ]]; then
  log_error "Feature directory not found: $FEATURE_DIR"
  exit 1
fi

TASKS_FILE="$REPO_ROOT/$FEATURE_DIR/tasks.md"

if [[ ! -f "$TASKS_FILE" ]]; then
  log_error "tasks.md not found in $FEATURE_DIR"
  log_error "Run /speckit.tasks to generate tasks first"
  exit 1
fi

# Extract feature name from directory
FEATURE_NAME=$(basename "$FEATURE_DIR" | sed 's/^[0-9]*-//' | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2));}1')
FEATURE_ID=$(basename "$FEATURE_DIR")

log_info "Creating GitHub issues from: $TASKS_FILE"
log_info "Feature: $FEATURE_NAME ($FEATURE_ID)"

if [[ "$DRY_RUN" == true ]]; then
  log_warning "DRY RUN MODE - No issues will be created"
fi

# Parse tasks.md and extract tasks
# Format: - [ ] [TaskID] [P?] [Story?] Description with file path
# Example: - [ ] T001 Create Maven project structure
# Example: - [ ] T021 [US1] Create DeviceRepository
# Example: - [ ] T033 [P] [US1] Create DeviceRegistrationRequest DTO

ISSUE_COUNT=0
PHASE=""

while IFS= read -r line; do
  # Detect phase headers
  if [[ "$line" =~ ^##[[:space:]]Phase[[:space:]][0-9]+: ]]; then
    PHASE=$(echo "$line" | sed 's/^## //' | sed 's/:.*$//')
    log_info "Processing $PHASE"
    continue
  fi
  
  # Skip non-task lines
  if [[ ! "$line" =~ ^-[[:space:]]\[[[:space:]]\][[:space:]]T[0-9]+ ]]; then
    continue
  fi
  
  # Parse task line
  TASK_LINE=$(echo "$line" | sed 's/^- \[ \] //')
  
  # Extract task ID (T001, T002, etc.)
  TASK_ID=$(echo "$TASK_LINE" | grep -o 'T[0-9]\+' | head -1)
  
  # Check for [P] marker (parallel)
  IS_PARALLEL=false
  if [[ "$TASK_LINE" =~ \[P\] ]]; then
    IS_PARALLEL=true
  fi
  
  # Extract story label (US1, US2, etc.)
  STORY_LABEL=""
  if [[ "$TASK_LINE" =~ \[US[0-9]+\] ]]; then
    STORY_LABEL=$(echo "$TASK_LINE" | grep -o '\[US[0-9]\+\]' | tr -d '[]')
  fi
  
  # Extract description (everything after markers)
  DESCRIPTION=$(echo "$TASK_LINE" | sed 's/T[0-9]\+[[:space:]]*//' | sed 's/\[P\][[:space:]]*//' | sed 's/\[US[0-9]\+\][[:space:]]*//')
  
  # Build issue title
  ISSUE_TITLE="[$TASK_ID] $DESCRIPTION"
  
  # Build issue body
  ISSUE_BODY="## Task Details

**Task ID**: $TASK_ID  
**Phase**: $PHASE  
**Feature**: $FEATURE_NAME ($FEATURE_ID)"
  
  if [[ -n "$STORY_LABEL" ]]; then
    ISSUE_BODY="$ISSUE_BODY  
**User Story**: $STORY_LABEL"
  fi
  
  if [[ "$IS_PARALLEL" == true ]]; then
    ISSUE_BODY="$ISSUE_BODY  
**Execution**: Can run in parallel with other [P] tasks"
  fi
  
  ISSUE_BODY="$ISSUE_BODY

## Description

$DESCRIPTION

## Acceptance Criteria

- [ ] Implementation matches task description
- [ ] Comprehensive test coverage (80%+)
- [ ] All tests pass
- [ ] Code follows project standards
- [ ] Documentation updated (if applicable)

## Reference Documents

- **Specification**: \`$FEATURE_DIR/spec.md\`
- **Plan**: \`$FEATURE_DIR/plan.md\`
- **Data Model**: \`$FEATURE_DIR/data-model.md\`
- **Contracts**: \`$FEATURE_DIR/contracts/\`
- **Tasks**: \`$FEATURE_DIR/tasks.md\`

## Constitution Check

This task must comply with:
- ✅ Principle II: Comprehensive Testing Standards (80% coverage, all tests passing)
- ✅ Principle IV: Integration Testing (use TestContainers where applicable)
- ✅ Quality Standards: 80%+ test coverage

## Notes

Mark this task as complete in \`$FEATURE_DIR/tasks.md\` by changing:
\`\`\`
- [ ] $TASK_ID ...
\`\`\`
to:
\`\`\`
- [x] $TASK_ID ...
\`\`\`
"
  
  # Build label list
  LABELS="feature,$FEATURE_ID"
  
  if [[ -n "$STORY_LABEL" ]]; then
    LABELS="$LABELS,$STORY_LABEL"
  fi
  
  if [[ "$IS_PARALLEL" == true ]]; then
    LABELS="$LABELS,parallel"
  fi
  
  # Add phase label
  PHASE_LABEL=$(echo "$PHASE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  LABELS="$LABELS,$PHASE_LABEL"
  
  # Create the issue
  if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo "----------------------------------------"
    echo "Title: $ISSUE_TITLE"
    echo "Labels: $LABELS"
    echo "Body preview:"
    echo "$ISSUE_BODY" | head -20
    echo "..."
    ISSUE_COUNT=$((ISSUE_COUNT + 1))
  else
    log_info "Creating issue: $ISSUE_TITLE"
    
    ISSUE_URL=$(gh issue create \
      --title "$ISSUE_TITLE" \
      --body "$ISSUE_BODY" \
      --label "$LABELS" \
      2>&1)
    
    if [[ $? -eq 0 ]]; then
      log_success "Created: $ISSUE_URL"
      ISSUE_COUNT=$((ISSUE_COUNT + 1))
    else
      log_error "Failed to create issue: $TASK_ID"
      log_error "$ISSUE_URL"
    fi
  fi
  
done < "$TASKS_FILE"

echo ""
log_success "Processed $ISSUE_COUNT tasks"

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  log_info "Run without --dry-run to create issues:"
  log_info "$0 $FEATURE_DIR"
else
  echo ""
  log_success "All issues created successfully!"
  log_info "View issues: gh issue list --label $FEATURE_ID"
  log_info "Or visit: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/issues?q=label:$FEATURE_ID"
fi
