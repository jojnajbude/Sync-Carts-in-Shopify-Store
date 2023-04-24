import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateLogDto } from "./dto/create-log.dto.js";
import { Log } from "./log.schema.js";

@Injectable()
export class LogsService {
  constructor(@InjectModel(Log.name) private logModel: Model<Log>) {}

  async createLog(createLogDto: CreateLogDto): Promise<Log> {
    const createdLog = new this.logModel(createLogDto);
    return createdLog.save();
  }

  async findAllLogs(domain: string): Promise<Log[]> {
    return this.logModel.find({ domain }).sort({ date: -1 }).exec();
  }
}
