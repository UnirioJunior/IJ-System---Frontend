import axios from "axios";
import { axiosInstance, BaseService } from "./BaseService";


export class UsuarioService extends BaseService {

    constructor() {
        super("/usuario");
    }

}