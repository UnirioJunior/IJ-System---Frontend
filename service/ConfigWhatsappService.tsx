import axios from "axios";
import { BaseService } from "./BaseService";


export class ConfigWhatsappService extends BaseService {

    constructor() {
        super("/whatsapp");
    }

}