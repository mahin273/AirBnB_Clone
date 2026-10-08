export type RoomStatus = 'available' | 'booked' | 'maintenance';

export type createRoomDto = {
  apartmentId: number;
  categoryId: number;
  roomNumber: string;
  floor?: number | null | undefined;
  status?: RoomStatus | undefined;
  pricePerNight?: number | undefined;
  isActive?: boolean | undefined;
};

export type updateRoomStatusDto = {
  status: RoomStatus;
};

export type roomFilterOptions = {
  status?: RoomStatus | undefined;
  categoryId?: number | undefined;
};
