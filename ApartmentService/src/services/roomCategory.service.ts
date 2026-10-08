import type { createRoomCategoryDto } from "../dto/roomCategory.dto.ts";
import { roomCategoryRepository } from '../repositories/roomCategory.repository.ts';
import { apartmentRepository } from '../repositories/apartment.repository.ts';
import { ForbiddenError, NotFoundError } from "../utils/errors/app.error.ts";

export async function createRoomCategoryService(
  apartmentId: number,
  hostId: number,
  data: Omit<createRoomCategoryDto, 'apartmentId'>
) {
  const apartment = await apartmentRepository.findById(apartmentId);
  if (!apartment) {
    throw new NotFoundError(`Apartment with id ${apartmentId} not found`);
  }
  if (apartment.hostId !== hostId) {
    throw new ForbiddenError('You do not have permission to manage categories for this apartment');
  }

  const roomCategory = await roomCategoryRepository.create({
    ...data,
    apartmentId,
  });
  return roomCategory;
}

export async function getAllRoomCategoryService() {
  const roomCategory = await roomCategoryRepository.findAll();
  return roomCategory;
}

export async function getRoomCategoryByIdService(id: number) {
  const roomCategory = await roomCategoryRepository.findById(id);
  if (!roomCategory) {
    throw new NotFoundError(`Room category with id ${id} not found`);
  }
  return roomCategory;
}

export async function getAllRoomCategoryByApartmentIdService(apartmentId: number) {
  const apartment = await apartmentRepository.findById(apartmentId);
  if (!apartment) {
    throw new NotFoundError(`Apartment with id ${apartmentId} not found`);
  }
  const roomCategories = await roomCategoryRepository.findAllByApartmentId(apartmentId);
  return roomCategories;
}

export async function softDeleteRoomCategoryService(id: number, requestingUserId: number) {
  const roomCategory = await roomCategoryRepository.findById(id);
  if (!roomCategory) {
    throw new NotFoundError(`Room category with id ${id} not found`);
  }

  const apartment = await apartmentRepository.findById(roomCategory.apartmentId);
  if (!apartment || apartment.hostId !== requestingUserId) {
    throw new ForbiddenError('You do not have permission to delete this room category');
  }

  return await roomCategoryRepository.softDelete(id);
}