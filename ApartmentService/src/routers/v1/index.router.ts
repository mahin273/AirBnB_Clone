import express from "express";
import pingRouter from "./ping.router.ts";
import hotelRouter from './apartment.router.ts';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/hotels', hotelRouter);


export default v1Router;
