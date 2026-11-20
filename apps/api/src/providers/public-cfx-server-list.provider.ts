import { CfxServerListItem, CfxServerListProvider } from './cfx-server-list.provider';

export class PublicCfxServerListProvider implements CfxServerListProvider {
  readonly name = 'CfxServerListProvider' as const;

  async discover(): Promise<CfxServerListItem[]> {
    throw new Error(
      'Cfx public provider is not configured. No synthetic server data is available.',
    );
  }
}
