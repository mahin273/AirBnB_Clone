import type { createRoomCategoryDto } from "../dto/roomCategory.dto.ts";
import { roomCategoryRepository} from '../repositories/roomCategory.repository.ts'
import { apartmentRepository } from '../repositories/apartment.repository.ts'
import { NotFoundError } from "../utils/errors/app.error.ts";

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

export async function getAllRoomCategoryByApartmentIdService(apartmentId:number){
    const apartment = await apartmentRepository.findById(apartmentId);
    if(!apartment){
        throw new NotFoundError(`Apartment with id ${apartmentId} not found`);
    }
    const roomCategories = await roomCategoryRepository.finaAllByApartmentId(apartmentId);
    return roomCategories;
}


export async function softDeleteRoomCategoryService(id:number){
    const roomCategory = await roomCategoryRepository.softDelete(id);
    if(!roomCategory){
        throw new NotFoundError(`Room Category with id ${id} not found`);
    }
    return roomCategory;
}