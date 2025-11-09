// This file is kept for backward compatibility but does not use Firebase
// All database operations are now handled through mock data in App.tsx

export const db = {
  ref: () => ({
    set: () => Promise.resolve(),
    on: () => {},
    off: () => {},
    push: () => ({ key: null }),
    update: () => Promise.resolve(),
  }),
};

export default {};
