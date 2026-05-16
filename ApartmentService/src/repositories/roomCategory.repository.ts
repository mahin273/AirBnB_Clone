import RoomCategory from "../db/models/roomCategory.ts";
import BaseRepository from "./base.repository.ts";

export class RoomCategoryRepository extends BaseRepository<RoomCategory>{
    constructor(){
        super(RoomCategory);
    }

}

export const roomCategoryRepository = new RoomCategoryRepository();
