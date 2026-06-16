#!/bin/bash

BASE_URL="http://localhost:8082/taskpro"

echo "========================================"
echo "Creating 5 Users with Tasks for TaskPro"
echo "========================================"
echo ""

# Function to create user and extract token
create_user() {
    local username=$1
    local email=$2
    local password=$3
    
    echo "Creating user: $username..."
    response=$(curl -s -X POST "$BASE_URL/user/signup" \
        -H "Content-Type: application/json" \
        -d "{\"userName\":\"$username\",\"email\":\"$email\",\"password\":\"$password\"}")
    
    token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✓ User $username created"
    echo "  Token: ${token:0:50}..."
    echo ""
    echo "$token"
}

# Function to create task
create_task() {
    local token=$1
    local title=$2
    local description=$3
    local status=$4
    local priority=$5
    local dueDate=$6
    
    curl -s -X POST "$BASE_URL/api/tasks" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "{\"title\":\"$title\",\"description\":\"$description\",\"status\":\"$status\",\"priority\":\"$priority\",\"dueDate\":\"$dueDate\"}" | grep -o '"id":{[^}]*}'
}

echo "--- USER 1: Alice (Project Manager) ---"
ALICE_TOKEN=$(create_user "alice" "alice.smith@techcorp.com" "Password123!")
if [ -n "$ALICE_TOKEN" ]; then
    echo "Creating tasks for Alice..."
    create_task "$ALICE_TOKEN" "Q2 Planning Meeting" "Prepare agenda and materials for Q2 strategic planning" "IN_PROGRESS" "HIGH" "2026-05-15T14:00:00"
    create_task "$ALICE_TOKEN" "Team Performance Review" "Complete quarterly performance evaluations for team members" "PENDING" "HIGH" "2026-05-20T17:00:00"
    create_task "$ALICE_TOKEN" "Budget Approval" "Submit budget proposal for Q3 to finance department" "PENDING" "MEDIUM" "2026-05-25T12:00:00"
    echo "✓ 3 tasks created for Alice"
    echo ""
fi

echo "--- USER 2: Bob (Senior Developer) ---"
BOB_TOKEN=$(create_user "bob" "bob.jones@techcorp.com" "Password123!")
if [ -n "$BOB_TOKEN" ]; then
    echo "Creating tasks for Bob..."
    create_task "$BOB_TOKEN" "API Authentication Module" "Implement JWT authentication for new API endpoints" "IN_PROGRESS" "HIGH" "2026-05-12T18:00:00"
    create_task "$BOB_TOKEN" "Database Optimization" "Optimize MongoDB queries for task search functionality" "PENDING" "MEDIUM" "2026-05-18T16:00:00"
    create_task "$BOB_TOKEN" "Code Review - Frontend" "Review and approve frontend PRs for dashboard component" "COMPLETED" "MEDIUM" "2026-05-08T15:00:00"
    create_task "$BOB_TOKEN" "Fix Login Bug" "Investigate and fix intermittent login failure issue" "IN_PROGRESS" "HIGH" "2026-05-10T12:00:00"
    echo "✓ 4 tasks created for Bob"
    echo ""
fi

echo "--- USER 3: Carol (UI/UX Designer) ---"
CAROL_TOKEN=$(create_user "carol" "carol.white@techcorp.com" "Password123!")
if [ -n "$CAROL_TOKEN" ]; then
    echo "Creating tasks for Carol..."
    create_task "$CAROL_TOKEN" "Dashboard Redesign" "Create new mockups for task dashboard with improved UX" "IN_PROGRESS" "HIGH" "2026-05-14T17:00:00"
    create_task "$CAROL_TOKEN" "Mobile Responsive Design" "Design mobile-friendly version of task cards" "PENDING" "MEDIUM" "2026-05-19T16:00:00"
    create_task "$CAROL_TOKEN" "Color Palette Update" "Update application color scheme based on brand guidelines" "COMPLETED" "LOW" "2026-05-07T14:00:00"
    echo "✓ 3 tasks created for Carol"
    echo ""
fi

echo "--- USER 4: Dave (QA Engineer) ---"
DAVE_TOKEN=$(create_user "dave" "dave.miller@techcorp.com" "Password123!")
if [ -n "$DAVE_TOKEN" ]; then
    echo "Creating tasks for Dave..."
    create_task "$DAVE_TOKEN" "Test API Endpoints" "Complete testing of all user authentication endpoints" "IN_PROGRESS" "HIGH" "2026-05-11T17:00:00"
    create_task "$DAVE_TOKEN" "Bug Regression Testing" "Run regression tests on task management features" "PENDING" "HIGH" "2026-05-16T15:00:00"
    create_task "$DAVE_TOKEN" "Test Documentation" "Update QA test cases and documentation" "PENDING" "MEDIUM" "2026-05-22T14:00:00"
    create_task "$DAVE_TOKEN" "Performance Testing" "Conduct load testing on task search API" "PENDING" "MEDIUM" "2026-05-28T12:00:00"
    echo "✓ 4 tasks created for Dave"
    echo ""
fi

echo "--- USER 5: Eve (Product Owner) ---"
EVE_TOKEN=$(create_user "eve" "eve.davis@techcorp.com" "Password123!")
if [ -n "$EVE_TOKEN" ]; then
    echo "Creating tasks for Eve..."
    create_task "$EVE_TOKEN" "Sprint Planning" "Plan and prioritize tasks for upcoming sprint" "IN_PROGRESS" "HIGH" "2026-05-13T10:00:00"
    create_task "$EVE_TOKEN" "Stakeholder Demo Prep" "Prepare demo presentation for stakeholders" "PENDING" "HIGH" "2026-05-17T14:00:00"
    create_task "$EVE_TOKEN" "User Stories Review" "Review and refine user stories for next release" "COMPLETED" "MEDIUM" "2026-05-06T16:00:00"
    create_task "$EVE_TOKEN" "Competitor Analysis" "Research competitor features for product roadmap" "PENDING" "LOW" "2026-05-24T17:00:00"
    echo "✓ 4 tasks created for Eve"
    echo ""
fi

echo "========================================"
echo "✓ All 5 users and 18 tasks created!"
echo "========================================"
echo ""
echo "Users created:"
echo "  1. alice (Project Manager) - 3 tasks"
echo "  2. bob (Senior Developer) - 4 tasks"
echo "  3. carol (UI/UX Designer) - 3 tasks"
echo "  4. dave (QA Engineer) - 4 tasks"
echo "  5. eve (Product Owner) - 4 tasks"
echo ""
echo "Login credentials for all users:"
echo "  Username: [alice|bob|carol|dave|eve]"
echo "  Password: Password123!"
