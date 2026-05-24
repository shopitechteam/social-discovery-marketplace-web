#!/bin/bash
set -e
cd /Users/mac/Desktop/social-commerce-shopi/shopi-social-commerce-web

components=(
  "input"
  "label"
  "textarea"
  "select"
  "checkbox"
  "switch"
  "badge"
  "avatar"
  "card"
  "sheet"
  "dialog"
  "sonner"
  "tabs"
  "separator"
  "skeleton"
  "toast"
  "scroll-area"
  "dropdown-menu"
  "popover"
  "tooltip"
)

for component in "${components[@]}"; do
  echo "=== Adding $component ==="
  npx shadcn@latest add "$component" --yes && echo "SUCCESS: $component" || echo "FAILED: $component"
done
