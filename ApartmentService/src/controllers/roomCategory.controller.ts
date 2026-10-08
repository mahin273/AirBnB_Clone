import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createRoomCategoryService,
  getAllRoomCategoryByApartmentIdService,
  getRoomCategoryByIdService,
  softDeleteRoomCategoryService,
} from '../services/roomCategory.service.ts';

export async function createRoomCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartmentId = Number(req.params.apartmentId);
    const hostId = req.user!.id;
    const roomCategory = await createRoomCategoryService(apartmentId, hostId, req.body);
    res.status(StatusCodes.CREATED).json({
      message: 'Room category created successfully',
      success: true,
      data: roomCategory,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoomCategoriesByApartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartmentId = Number(req.params.apartmentId);
    const roomCategories = await getAllRoomCategoryByApartmentIdService(apartmentId);
    res.status(StatusCodes.OK).json({
      message: 'Room categories retrieved successfully',
      success: true,
      data: roomCategories,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRoomCategoryByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const roomCategory = await getRoomCategoryByIdService(id);
    res.status(StatusCodes.OK).json({
      message: 'Room category retrieved successfully',
      success: true,
      data: roomCategory,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteRoomCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const hostId = req.user!.id;
    const deletedCategory = await softDeleteRoomCategoryService(id, hostId);
    res.status(StatusCodes.OK).json({
      message: 'Room category deleted successfully',
      success: true,
      data: deletedCategory,
    });
  } catch (error) {
    next(error);
  }
}
