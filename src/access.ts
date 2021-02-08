// src/access.ts
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser,isAdmin } = initialState || {};

  console.info("initialState",initialState);
  return {
    adminRouteFilter: () => isAdmin, // 只有管理员可访问
    canAdmin: currentUser && currentUser.access === 'admin',
  };
}
