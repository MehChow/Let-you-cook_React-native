export interface AuthConcurrencyHooks {
  afterRefreshLookup?(): Promise<void>;
  afterAccountDeletionLock?(): Promise<void>;
  afterPasswordResetAccountLock?(): Promise<void>;
}
