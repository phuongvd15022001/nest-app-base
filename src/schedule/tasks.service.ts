import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_5_SECONDS)
  handleEveryFiveSeconds() {
    this.logger.debug('Called every 5 seconds');
  }

  @Cron('0 30 9 * * 1-5') // Runs at 9:30 AM on weekdays (Monday-Friday)
  handleDailyReport() {
    this.logger.log('Generating daily report...');
  }

  @Cron('0 0 0 1 * *') // Runs on the first day of every month at midnight
  handleMonthlyCleanup() {
    this.logger.log('Performing monthly data cleanup.');
  }
}
