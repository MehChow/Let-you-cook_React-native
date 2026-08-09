export interface AuthConcurrencyHooks {
  afterRefreshLookup?(): Promise<void>;
  afterAccountDeletionLock?(): Promise<void>;
}
