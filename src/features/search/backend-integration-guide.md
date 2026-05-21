# Search Backend Integration Guide

## Summary
The current search experience is a frontend demo built on mocked recipe data. The search screen already separates committed search state from the filter sheet UI conceptually, and the filter sheet now stages changes locally until the user presses `Apply`.

## Search Inputs
- Free-text query from the search bar
- Suggested search chips
- Category selection
- Sort option: `relevance`, `top_rated`, `newest`, `quickest`
- Cooking time range
- Calories range
- Servings range

## Current Frontend Behavior
- Search results are derived from the committed filter state in the shared search store.
- The filter sheet owns a local draft copy of the filters while it is open.
- `Reset` only resets the draft values shown in the filter sheet.
- `Apply` shows a 1-second fake loading state, then commits the draft filters and closes the sheet.
- Suggested chip matching checks:
  - recipe title
  - recipe description
  - recipe tag
  - recipe author
  - category label

## Backend Expectations
- The backend search endpoint should accept the same filter inputs as the frontend store so the UI can keep its current shape.
- Category text should be searchable by backend as well, not only category IDs, so suggested chips like `vegan` behave consistently with the current frontend demo.
- Real filter apply should become an async request instead of the current 1-second fake loading state.
- The response should support the existing card fields used by the search results UI.

## Notes for Sorting
- `relevance`, `top_rated`, and `quickest` can already be represented with the current mock data shape.
- `newest` is intentionally not implemented yet in the frontend demo logic.
- The current recipe model does not include a created-time field such as `createdAt`.
- Backend integration should provide a sortable created-time field so `newest` can be implemented correctly without relying on array order.
