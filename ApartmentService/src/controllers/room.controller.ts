import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createRoomService,
  getRoomsByApartmentService,
  getRoomByIdService,
  updateRoomStatusService,
  softDeleteRoomService,
} from '../services/room.service.ts';
import type { RoomStatus } from '../dto/room.dto.ts';

export async function createRoomHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartmentId = Number(req.params.apartmentId);
    const hostId = req.user!.id;
    const room = await createRoomService(apartmentId, hostId, req.body);
    res.status(StatusCodes.CREATED).json({
      message: 'Room created successfully',
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoomsByApartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartmentId = Number(req.params.apartmentId);
    const filter = {
      status: req.query.status as RoomStatus | undefined,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
    };
    const rooms = await getRoomsByApartmentService(apartmentId, filter);
    res.status(StatusCodes.OK).json({
      message: 'Rooms retrieved successfully',
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoomByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const room = await getRoomByIdService(id);
    res.status(StatusCodes.OK).json({
      message: 'Room retrieved successfully',
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRoomStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const hostId = req.user!.id;
    const { status } = req.body;
    const room = await updateRoomStatusService(id, hostId, status);
    res.status(StatusCodes.OK).json({
      message: 'Room status updated successfully',
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteRoomHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const hostId = req.user!.id;
    const deletedRoom = await softDeleteRoomService(id, hostId);
    res.status(StatusCodes.OK).json({
      message: 'Room deleted successfully',
      success: true,
      data: deletedRoom,
    });
  } catch (error) {
    next(error);
  }
}
