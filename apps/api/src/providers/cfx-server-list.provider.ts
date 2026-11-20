export interface CfxServerIdentity {
  externalId: string;
  joinCode: string | null;
  name: string;
}

export interface CfxServerListItem {
  identity: CfxServerIdentity;
  playerCount: number | null;
  maxPlayers: number | null;
  source: 'CFX_PUBLIC_SERVER_LIST';
  observedAt: Date;
  freshness: 'fresh';
}

export interface CfxServerListProvider {
  readonly name: 'CfxServerListProvider';
  discover(): Promise<CfxServerListItem[]>;
}
