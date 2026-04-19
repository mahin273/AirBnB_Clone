import type{ Request,Response } from "express";


export const pingHandler = (req: Request, res: Response):void => {
    res.json(
        { 
        message: "Hello This is pong",
        success: true,
        status: 200

    }
    );

};