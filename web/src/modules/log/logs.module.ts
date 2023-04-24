import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Log, LogSchema } from "./log.schema.js";
import { LogsController } from "./logs.controller.js";
import { LogsService } from "./logs.service.js";

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  controllers: [LogsController],
  providers: [LogsService],
  exports:[LogsService]
})
export class LogModule {}