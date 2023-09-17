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
  load: Parcel[];
}

export interface Parcel {
  name: string;
  weight: number;
  at: Node;
  dest: Node;
}

export interface Move {
  train: Train;
  from: Node;
  to: Node;
  distance: number;
}