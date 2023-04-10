import { Controller } from "@nestjs/common";
import { ItemsService } from "./item.service.js";

@Controller('/items')
export class ItemsController {
  constructor (private itemsService: ItemsService) {}


}