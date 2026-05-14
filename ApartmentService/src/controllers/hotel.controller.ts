import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createHotelService, getAllHotelsService, getHotelByIdService,softDeleteHotelService } from '../services/hotel.service.ts';


export async function createHotelHandler(req:Request,res:Response,next:NextFunction){
    // Call the service to create a hotel
    const hotel = await createHotelService(req.body);
    res.status(StatusCodes.CREATED).json({
      message: 'Hotel created successfully',
      success: true,
      data: hotel,
    });
  }

export async function getHotelByIdHandler(req:Request,res:Response,next:NextFunction){
    const hotel = await getHotelByIdService(Number(req.params.id));
    res.status(StatusCodes.OK).json({
      message: 'Hotel retrieved successfully',
      success: true,
      data: hotel,
    });
  }


  export async function getAllHotelsHandler(req:Request,res:Response,next:NextFunction){
    const hotels =await getAllHotelsService();
    res.status(StatusCodes.OK).json({
      message:'Hotels retrieved successfully',
      success:true,
      data:hotels,
    })
  }


  export async function softDeleteHotelHandler(req:Request,res:Response,next:NextFunction){
    const hotel = await softDeleteHotelService(Number(req.params.id));
    res.status(StatusCodes.OK).json({
      message:'Hotel deleted successfully',
      success:true,
      data:hotel,
    })
  }
