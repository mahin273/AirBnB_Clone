import type{ AnyZodObject } from "zod/v3";
import type{ Request, Response, NextFunction } from "express";



/**
 * 
 * @param schema - zod schema to validate request body
 * @returns - Middleware function to validate the request body
 */
export const validateRequestBody =(schema: AnyZodObject)=>{
    return async (req:Request, res:Response,next:NextFunction)=>{
        try{
            await schema.parseAsync(req.body);
            next();

        }catch(error){
            return res.status(400).json({
                message: "Invalid request body",
                success: false,
                error: error
            });
        }

    }
}

export const validateRequestQuery =(schema: AnyZodObject)=>{
    return async (req:Request, res:Response,next:NextFunction)=>{
        try{
            await schema.parseAsync(req.query);
            next();
        }catch(error){
            return res.status(400).json({
                message: "Invalid request query",
                success: false,
                error: error
            });
        }
    }
}

