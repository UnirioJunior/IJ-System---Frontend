import axios from "axios";
import { BaseService } from "./BaseService";


export class PacienteService extends BaseService {

    constructor(){
        super("/paciente");
    }

}