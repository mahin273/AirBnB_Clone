import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createHotelService, getAllHotelsService, getHotelByIdService } from '../services/hotel.service.ts';


export async function createHotelHandler(req:Request,res:Response){
    // Call the service to create a hotel
    const hotel = await createHotelService(req.body);
    res.status(StatusCodes.CREATED).json({
      message: 'Hotel created successfully',
      success: true,
      data: hotel,
    });
  }

export async function getHotelByIdHandler(req:Request,res:Response){
    const hotel = await getHotelByIdService(Number(req.params.id));
    res.status(StatusCodes.OK).json({
      message: 'Hotel retrieved successfully',
      success: true,
      data: hotel,
    });
  }


  export async function getAllHotelsHandler(req:Request,res:Response){
    const hotels =await getAllHotelsService();
    res.status(StatusCodes.OK).json({
      message:'Hotels retrieved successfully',
      success:true,
      data:hotels,
    })
  }
