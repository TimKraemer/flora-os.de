export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  const { startInstagramSync } = await import('@/lib/instagram/scheduler');
  const { startMenuSync } = await import('@/lib/google/menu-sync');
  const { startReviewSync } = await import('@/lib/google/review-sync');
  startInstagramSync();
  startMenuSync();
  startReviewSync();
}
