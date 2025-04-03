import { StatusEnum } from "../utils/enums";

export type User = {
  name: string;
  role: string;
  username: string;
};

export interface GuestInput {
  name: string;
  phoneNumber: string;
  numberOfGuests: number;
  waitingTime: string;
  preferSharing?: boolean;
}

export interface Guest extends GuestInput {
  _id: string;
  status: StatusEnum;
  entryTime: string;
  waitingTime: string;
}
