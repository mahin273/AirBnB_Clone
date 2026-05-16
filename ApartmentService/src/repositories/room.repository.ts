import Room from "../db/models/room.ts";
import BaseRepository from "./base.repository.ts";

export class RoomRepository extends BaseRepository<Room>{
    constructor(){
        super(Room);
    }
}