import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { LoginAttempt } from '../auth/entities/login-attempt.entity';
import { PageView } from '../analytics/entities/page-view.entity';
import { Media } from '../media/entities/media.entity';
import { Article } from '../articles/entities/article.entity';
import { Project } from '../projects/entities/project.entity';
import { Product } from '../products/entities/product.entity';
import { ServicesModule } from '../../common/services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RefreshToken,
      LoginAttempt,
      PageView,
      Media,
      Article,
      Project,
      Product,
    ]),
    BullModule.registerQueue({ name: 'traffic-sync' }),
    ServicesModule,
  ],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}
