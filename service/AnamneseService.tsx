import axios from "axios";
import { BaseService } from "./BaseService";


export class AnamneseService extends BaseService {

    constructor(){
        super("/anamnese");
    }

}