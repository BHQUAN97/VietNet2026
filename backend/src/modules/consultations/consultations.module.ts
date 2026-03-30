import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from './entities/consultation.entity';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { QueuesModule } from '../../queues/queues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consultation]),
    forwardRef(() => NotificationsModule),
    QueuesModule,
  ],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
