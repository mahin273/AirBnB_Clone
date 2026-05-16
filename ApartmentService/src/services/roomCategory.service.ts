import type { createRoomCategoryDto } from "../dto/roomCategory.dto.ts";
import { roomCategoryRepository} from '../repositories/roomCategory.repository.ts'


export async function createRoomCategoryService(roomCategoryData:createRoomCategoryDto){
    const roomCategory = await roomCategoryRepository.create(roomCategoryData);
    return roomCategory;
}

export async function getAllRoomCategoryService(){
    const  roomCategory = await roomCategoryRepository.findAll();
    return roomCategory;
}

export async function getRoomCategoryByIdService(id:number){
    const roomCategory = await roomCategoryRepository.findById(id);
    return roomCategory;
}


export async function softDeleteRoomCategoryService(id:number){
    const roomCategory = await roomCategoryRepository.softDelete(id);
    return roomCategory;
}