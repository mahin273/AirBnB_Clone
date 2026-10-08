import type { createRoomDto, roomFilterOptions, RoomStatus } from "../dto/room.dto.ts";
import { roomRepository } from "../repositories/room.repository.ts";
import { apartmentRepository } from "../repositories/apartment.repository.ts";
import { roomCategoryRepository } from "../repositories/roomCategory.repository.ts";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors/app.error.ts";

export async function createRoomService(
  apartmentId: number,
  hostId: number,
  data: Omit<createRoomDto, "apartmentId">
) {
  const apartment = await apartmentRepository.findById(apartmentId);
  if (!apartment) {
    throw new NotFoundError(`Apartment with id ${apartmentId} not found`);
  }
  if (apartment.hostId !== hostId) {
    throw new ForbiddenError(
      "You do not have permission to manage rooms for this apartment"
    );
  }

  const category = await roomCategoryRepository.findById(data.categoryId);
  if (!category) {
    throw new NotFoundError(
      `Room category with id ${data.categoryId} not found`
    );
  }
  if (category.apartmentId !== apartmentId) {
    throw new BadRequestError(
      "Room category does not belong to the specified apartment"
    );
  }

  const existingRoom = await roomRepository.findByApartmentAndRoomNumber(
    apartmentId,
    data.roomNumber
  );
  if (existingRoom) {
    throw new ConflictError(
      `Room number '${data.roomNumber}' already exists in this apartment`
    );
  }

  const pricePerNight = data.pricePerNight ?? category.basePricePerNight;
  const status: RoomStatus = data.status ?? "available";

  const room = await roomRepository.create({
    ...data,
    apartmentId,
    pricePerNight,
    status,
  });

  return room;
}

export async function getRoomsByApartmentService(
  apartmentId: number,
  filter?: roomFilterOptions
) {
  const apartment = await apartmentRepository.findById(apartmentId);
  if (!apartment) {
    throw new NotFoundError(`Apartment with id ${apartmentId} not found`);
  }
  const rooms = await roomRepository.findAllByApartmentId(apartmentId, filter);
  return rooms;
}

export async function getRoomByIdService(id: number) {
  const room = await roomRepository.findById(id);
  if (!room) {
    throw new NotFoundError(`Room with id ${id} not found`);
  }
  return room;
}

export async function updateRoomStatusService(
  id: number,
  hostId: number,
  status: RoomStatus
) {
  const room = await roomRepository.findById(id);
  if (!room) {
    throw new NotFoundError(`Room with id ${id} not found`);
  }

  const apartment = await apartmentRepository.findById(room.apartmentId);
  if (!apartment || apartment.hostId !== hostId) {
    throw new ForbiddenError(
      "You do not have permission to modify this room"
    );
  }

  await room.update({ status });
  return room;
}

export async function softDeleteRoomService(id: number, hostId: number) {
  const room = await roomRepository.findById(id);
  if (!room) {
    throw new NotFoundError(`Room with id ${id} not found`);
  }

  const apartment = await apartmentRepository.findById(room.apartmentId);
  if (!apartment || apartment.hostId !== hostId) {
    throw new ForbiddenError(
      "You do not have permission to delete this room"
    );
  }

  return await roomRepository.softDelete(id);
}
