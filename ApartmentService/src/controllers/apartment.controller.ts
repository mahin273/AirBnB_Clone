import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createApartmentService,
  getAllApartmentsService,
  getApartmentByIdService,
  getHostApartmentsService,
  softDeleteApartmentService
} from '../services/apartment.service.ts';

export async function createApartmentlHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartment = await createApartmentService({
      ...req.body,
      hostId: req.user!.id,
    });
    res.status(StatusCodes.CREATED).json({
      message: 'Apartment created successfully',
      success: true,
      data: apartment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getApartmentByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartment = await getApartmentByIdService(Number(req.params.id));
    res.status(StatusCodes.OK).json({
      message: 'Apartment retrieved successfully',
      success: true,
      data: apartment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllApartmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartments = await getAllApartmentsService();
    res.status(StatusCodes.OK).json({
      message: 'Apartments retrieved successfully',
      success: true,
      data: apartments,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyApartmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartments = await getHostApartmentsService(req.user!.id);
    res.status(StatusCodes.OK).json({
      message: 'Host apartments retrieved successfully',
      success: true,
      data: apartments,
    });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteApartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const apartment = await softDeleteApartmentService(Number(req.params.id), req.user!.id);
    res.status(StatusCodes.OK).json({
      message: 'Apartment deleted successfully',
      success: true,
      data: apartment,
    });
  } catch (error) {
    next(error);
  }
}
