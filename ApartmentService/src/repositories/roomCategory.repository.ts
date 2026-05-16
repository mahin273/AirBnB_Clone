import RoomCategory from "../db/models/roomCategory.ts";
import { NotFoundError } from "../utils/errors/app.error.ts";
import BaseRepository from "./base.repository.ts";
import logger from "../config/logger.ts";

export class RoomCategoryRepository extends BaseRepository<RoomCategory>{
    constructor(){
        super(RoomCategory);
    }

    async finaAllByApartmentId(apartmentId:number){
        const roomCategories = await this.model.findAll({
            where:{
                apartmentId:apartmentId,
                deletedAt: null
            }
        })
        if(!roomCategories || roomCategories.length ===0){
            throw new NotFoundError(`No room Categories found for apartment id ${apartmentId}`)
        }
        logger.info(`Room Categories found for apartment id ${apartmentId}`)
        return roomCategories;
    }

}

export const roomCategoryRepository = new RoomCategoryRepository();
