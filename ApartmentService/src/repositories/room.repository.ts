import Room from "../db/models/room.ts";
import BaseRepository from "./base.repository.ts";
import logger from "../config/logger.ts";
import type { WhereOptions } from "sequelize";

export class RoomRepository extends BaseRepository<Room> {
  constructor() {
    super(Room);
  }

  async findAllByApartmentId(
    apartmentId: number,
    filter?: { status?: string | undefined; categoryId?: number | undefined }
  ): Promise<Room[]> {
    const whereClause: WhereOptions<Room> = {
      apartmentId,
    };

    if (filter?.status) {
      whereClause.status = filter.status;
    }
    if (filter?.categoryId) {
      whereClause.categoryId = filter.categoryId;
    }

    const rooms = await this.model.findAll({
      where: whereClause,
    });
    logger.info(`Rooms found for apartment id ${apartmentId}: ${rooms.length}`);
    return rooms;
  }

  async findAllByCategoryId(categoryId: number): Promise<Room[]> {
    const rooms = await this.model.findAll({
      where: {
        categoryId,
      },
    });
    logger.info(`Rooms found for category id ${categoryId}: ${rooms.length}`);
    return rooms;
  }

  async findByApartmentAndRoomNumber(apartmentId: number, roomNumber: string): Promise<Room | null> {
    const room = await this.model.findOne({
      where: {
        apartmentId,
        roomNumber,
      },
    });
    return room;
  }

  async updateStatus(id: number, status: string): Promise<Room | null> {
    const room = await this.findById(id);
    if (!room) {
      return null;
    }
    await room.update({ status });
    logger.info(`Room ${id} status updated to ${status}`);
    return room;
  }
}

export const roomRepository = new RoomRepository();