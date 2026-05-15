import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createApartmentService, getAllApartmentsService, getApartmentByIdService,softDeleteApartmentService } from '../services/apartment.service.ts';


export async function createApartmentlHandler(req:Request,res:Response,next:NextFunction){
    // Call the service to create a hotel
    const apartment = await createApartmentService(req.body);
    res.status(StatusCodes.CREATED).json({
      message: 'Apartment created successfully',
      success: true,
      data: apartment,
    });
  }

export async function getApartmentByIdHandler(req:Request,res:Response,next:NextFunction){
    const apartment = await getApartmentByIdService(Number(req.params.id));
    res.status(StatusCodes.OK).json({
      message: 'Apartment retrieved successfully',
      success: true,
      data: apartment,
    });
  }


  export async function getAllApartmentsHandler(req:Request,res:Response,next:NextFunction){
    const apartments =await getAllApartmentsService();
    res.status(StatusCodes.OK).json({
      message:'Apartments retrieved successfully',
      success:true,
      data:apartments,
    })
  }


  export async function softDeleteApartmentHandler(req:Request,res:Response,next:NextFunction){
    const apartment = await softDeleteApartmentService(Number(req.params.id));
    res.status(StatusCodes.OK).json({
      message:'Apartment deleted successfully',
      success:true,
      data:apartment,
    })
  }
