import express from "express";
import pingRouter from "./ping.router.ts";
import hotelRouter from './apartment.router.ts';
import roomCategoryRouter from './roomCategory.router.ts';

const v1Router = express.Router();

v1Router.use('/ping', pingRouter);
v1Router.use('/apartments', hotelRouter);
v1Router.use('/categories', roomCategoryRouter);

export default v1Router;

