import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ServersController } from './servers/servers.controller';
import { EntitlementsService } from './subscriptions/entitlements.service';

@Module({
  controllers: [HealthController, ServersController],
  providers: [EntitlementsService],
})
export class AppModule {}
