import { WarehousePosition } from "../../types";

export interface ClosestLocationResult {
  location: WarehousePosition;
  distance: number;
  productIndex: number;
}
