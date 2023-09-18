import Graph from 'graph-data-structure'
import { Node, Edge, Train, Parcel, Action, ActionType } from './types'
import * as _ from 'lodash'
import { Population } from './population'
import { Member } from './member'

// Initialize the population
// const N1 = { name: 'N1' }
// const N2 = { name: 'N2' }
// const N3 = { name: 'N3' }
// const nodes: Node[] = [N1, N2, N3]

// const E1 = { name: 'E1', from: N1, to: N2, distance: 30 }
// const E2 = { name: 'E2', from: N2, to: N3, distance: 10 }
// const edges: Edge[] = [E1, E2]

// const T1 = { name: 'T1', capacity: 5, at: N2 }
// const trains: Train[] = [T1]

// const P1 = { name: 'P1', weight: 5, at: N1, dest: N3 }
// const parcels: Parcel[] = [P1]

const N1 = { name: 'N1' }
const N2 = { name: 'N2' }
const N3 = { name: 'N3' }
const N4 = { name: 'N4' }
const N5 = { name: 'N5' }
const nodes: Node[] = [N1, N2, N3, N4, N5]

const E1 = { name: 'E1', from: N1, to: N2, distance: 30 }
const E2 = { name: 'E2', from: N2, to: N3, distance: 10 }
const E3 = { name: 'E3', from: N3, to: N4, distance: 50 }
const E4 = { name: 'E4', from: N4, to: N5, distance: 10 }
const edges: Edge[] = [E1, E2, E3, E4]

const T1 = { name: 'T1', capacity: 5, at: N2 }
const T2 = { name: 'T2', capacity: 10, at: N5 }
const trains: Train[] = [T1, T2]

const P1 = { name: 'P1', weight: 5, at: N1, dest: N3 }
const P2 = { name: 'P2', weight: 5, at: N4, dest: N1 }
const P3 = { name: 'P2', weight: 10, at: N1, dest: N2 }
const parcels: Parcel[] = [P1, P2, P3]


// GA Settings
const populationSize = 5000
const tournamentSize = 2
const mutationRate = 0.2
const maxGenerations = 100

let currentGenerations = 0
let bestMember = new Member([])
bestMember.fitness = Number.MAX_SAFE_INTEGER

const population = new Population(populationSize, tournamentSize, mutationRate, nodes, edges, trains, parcels)
population.calcAllFitnessValues()

while (population.generations < maxGenerations) {
  population.newGeneration()
  population.calcAllFitnessValues()

  const bestMemberOfGeneration = population.getBestMemberOfGeneration()
  if (bestMemberOfGeneration.fitness < bestMember.fitness) bestMember = bestMemberOfGeneration

  console.log(`CURRENT BEST: fitness=${bestMember.fitness}, overload=${bestMember.overload}, distance=${bestMember.distance}`)
}

console.log(bestMember.actions.map(action => { return `${action.type} ${action.parcel.name} ${action.train.name}` }))
bestMember.printMoves(population.trains, population.graph)