import type{ Request,Response } from 'express';
import { createHotelService,getHotelByIdService } from '../services/hotel.service.ts';


export async function createHotelHandler(req:Request,res:Response){
    // Call the service to create a hotel
    const hotel = await createHotelService(req.body);
    res.status(201).json({
      message: 'Hotel created successfully',
      success: true,
      data: hotel,
    });
  }

export async function getHotelByIdHandler(req:Request,res:Response){
    const hotel = await getHotelByIdService(Number(req.params.id));
    res.status(200).json({
      message: 'Hotel retrieved successfully',
      success: true,
      data: hotel,
    });
  }
