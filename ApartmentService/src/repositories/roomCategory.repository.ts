import RoomCategory from "../db/models/roomCategory.ts";
import BaseRepository from "./base.repository.ts";
import logger from "../config/logger.ts";


export class RoomCategoryRepository extends BaseRepository<RoomCategory>{
    constructor(){
        super(RoomCategory);
    }

    async findAllByApartmentId(apartmentId: number): Promise<RoomCategory[]> {
        const roomCategories = await this.model.findAll({
            where: {
                apartmentId,
            },
        });
        logger.info(`Room Categories found for apartment id ${apartmentId}: ${roomCategories.length}`);
        return roomCategories;
    }

    async finaAllByApartmentId(apartmentId: number): Promise<RoomCategory[]> {
        return this.findAllByApartmentId(apartmentId);
    }
}

export const roomCategoryRepository = new RoomCategoryRepository();
