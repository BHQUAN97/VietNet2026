import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PageView } from './entities/page-view.entity';
import { PageViewDaily } from './entities/page-view-daily.entity';
import { EmailLog } from './entities/email-log.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SeoController } from './seo.controller';
import { Project } from '../projects/entities/project.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../projects/entities/category.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      PageView,
      PageViewDaily,
      EmailLog,
      Project,
      Product,
      Category,
    ]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [AnalyticsController, SeoController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
