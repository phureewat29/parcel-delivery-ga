import Graph from 'graph-data-structure'
import { Node, Edge, Train, Parcel, Move } from './types'
import * as _ from 'lodash'

// Initialize the population
const N1 = { name: 'N1' }
const N2 = { name: 'N2' }
const N3 = { name: 'N3' }
const nodes: Node[] = [N1, N2, N3]

const E1 = { name: 'E1', from: N1, to: N2, distance: 30 }
const E2 = { name: 'E2', from: N2, to: N3, distance: 10 }
const edges: Edge[] = [E1, E2]

const T1 = { name: 'T1', capacity: 6, at: N2, load: [] }
const trains: Train[] = [T1]

const P1 = { name: 'P1', weight: 5, at: N1, dest: N3 }
const parcels: Parcel[] = [P1]

// Global variables
const moves: Move[] = []

const graph = Graph()
nodes.forEach(node => graph.addNode(node.name));
edges.forEach(edge => {
  graph.addEdge(edge.from.name, edge.to.name, edge.distance)
  graph.addEdge(edge.to.name, edge.from.name, edge.distance)
});

const findCloestTrain = (trains: Train[], p: Parcel): Train => {
  let bestTrain = trains[0]
  let bestDistance = Number.MAX_SAFE_INTEGER

  trains.forEach(t => {
    const distance = graph.getEdgeWeight(t.at.name, p.at.name)
    if (distance < bestDistance) {
      bestTrain = t
      bestDistance = distance
    }
  })

  return bestTrain
}

const buildMoves = (train: Train, from: Node, to: Node) => {
  const path = graph.shortestPath(from.name, to.name)
  for (let i = 0; i < path.length - 1; i++) {
    const distance = graph.getEdgeWeight(nodes[i].name, nodes[i + 1].name)
    moves.push({ train, from: nodes[i], to: nodes[i + 1], distance })
    console.log(`Move ${train.name} from ${nodes[i].name} to ${nodes[i + 1].name} takes ${graph.getEdgeWeight(nodes[i].name, nodes[i + 1].name)} minutes`)
  }
}

// on every processing loop:
// find the shortest path to the parcel destination (if train carring parcels)
// - or pick up more if take lower cost
// find the closest train (with enough capacity) to the parcel pickup point.
// move the train to the local best move.
// pick the parcel if the train arrives at the pickup point

for (let i = 0; i < parcels.length; i++) {
  // find the cloeset train
  const closestTrain = findCloestTrain(trains, parcels[i])
  buildMoves(closestTrain, closestTrain.at, parcels[i].at)
  trains[0].at = parcels[i].at
  trains[0].load.push(parcels[i])
}

for (let i = 0; i < trains.length; i++) {
  for (let j = 0; j < trains[i].load.length; j++) {
    const parcel = trains[i].load[j]
    buildMoves(trains[i], trains[i].at, parcel.dest)
    trains[0].at = parcels[i].dest
    trains[0].load = trains[0].load.filter(p => p.name !== parcel.name)
  }
}

type PossibleMove = {
  train: Train,
  from: Node,
  to: Node,
  distance: number
}



