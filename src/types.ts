export interface Node {
  name: string;
}

export interface Edge {
  from: Node;
  to: Node;
  distance: number;
}

export interface Train {
  name: string;
  capacity: number;
  at: Node;
}

export interface Parcel {
  name: string;
  weight: number;
  at: Node;
  dest: Node;
}

export enum ActionType {
  LOAD = "LOAD",
  UNLOAD = "UNLOAD"
}

export interface Action {
  type: ActionType;
  parcel: Parcel,
  train: Train
}