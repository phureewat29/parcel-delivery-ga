import Graph from 'graph-data-structure'
import { Node, Edge, Train, Parcel, Action, ActionType } from './types'
import * as _ from 'lodash'

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
const T2 = { name: 'T2', capacity: 5, at: N5 }
const trains: Train[] = [T1, T2]

const P1 = { name: 'P1', weight: 5, at: N1, dest: N3 }
const P2 = { name: 'P2', weight: 5, at: N4, dest: N1 }
const parcels: Parcel[] = [P1, P2]


// GA Settings
let population: Action[][] = [];
let possibleActions: Action[] = [];
const populationSize = 1000
const tournamentSize = 2
const mutationRate = 0.2
let currentGenerations = 0
const maxGenerations = 5


const graph = Graph()
nodes.forEach(node => graph.addNode(node.name));
edges.forEach(edge => {
  graph.addEdge(edge.from.name, edge.to.name, edge.distance)
  graph.addEdge(edge.to.name, edge.from.name, edge.distance)
});

trains.map(train => {
  parcels.map(parcel => {
    possibleActions.push({ type: ActionType.LOAD, parcel, train })
    possibleActions.push({ type: ActionType.UNLOAD, parcel, train })
  })
})

const generateRandomSolution = () => {
  for (let i = 0; i < populationSize; i++) {
    const randomSolution = _.shuffle(possibleActions).slice(0, trains.length * parcels.length)
    population.push(randomSolution)
  }
}

const calcAllFitness = () => {
  for (let i = 0; i < population.length; i++) {
    calcSolutionFitness(population[i])
  }
}

const calcSolutionFitness = (actions: Action[]) => {
  let distance = 0;
  let overload = 0;
  const processedParcels = []
  for (let i = 0; i < trains.length; i++) {
    const trainActions = actions.filter(action => action.train.name === trains[i].name)
    if (trainActions.length === 0) continue
    distance += calcTrainRouteFitness(trainActions)
    overload += calcTrainRouteOverload(trainActions, trains[i].capacity)
    // check duplicate load/unload parcels between trains
    processedParcels.push(_.uniq(trainActions.map(action => action.parcel.name)))
  }
  overload += _.intersection(...processedParcels).length

  return distance + overload * 1000
}

const calcTrainRouteFitness = (actions: Action[]): number => {
  let distance = 0;
  let trainStartPoint = actions[0].train.at.name

  for (let i = 0; i < actions.length; i++) {
    const dest = actions[i].type === ActionType.LOAD ? actions[i].parcel.at : actions[i].parcel.dest
    distance += graph.shortestPath(trainStartPoint, dest.name).weight || Number.MAX_SAFE_INTEGER
  }
  return distance
}

const calcTrainRouteOverload = (actions: Action[], maxCapacity: number): number => {
  let overload = 0;

  // check load/unload completeness
  const loads = actions
    .filter(action => action.type === ActionType.LOAD)
    .map(action => action.parcel.name)
  const unloads = actions
    .filter(action => action.type === ActionType.UNLOAD)
    .map(action => action.parcel.name)
  const leftover = loads.filter(load => !unloads.includes(load))
  overload += leftover.length

  // check capacity overload
  let currentWeight = 0;
  for (let i = 0; i < actions.length; i++) {
    if (actions[i].type === ActionType.LOAD) {
      currentWeight += actions[i].parcel.weight
    } else {
      currentWeight -= actions[i].parcel.weight
    }
    if (currentWeight < 0 || currentWeight > maxCapacity) overload++
  }

  return overload
}

const tournamentSelection = (): Action[] => {
  const tournamentPopulation: Action[][] = []
  for (let i = 0; i < tournamentSize; i++) {
    const randomSolution = population[Math.floor(Math.random() * population.length)]
    tournamentPopulation.push(randomSolution)
  }
  return tournamentPopulation.sort((a, b) => calcSolutionFitness(a) - calcSolutionFitness(b))[0]
}
const swapGenes = (genes: Action[], a: number, b: number) => {
  const temp = genes[b]
  genes[b] = genes[a]
  genes[a] = temp
  return genes
}

const getRandomIndexes = (max: number): [number, number] => {
  const indexA = Math.floor(Math.random() * max);
  let indexB = Math.floor(Math.random() * max);
  if (indexA === indexB) indexB >= max - 1 ? indexB-- : indexB++;
  return [indexA, indexB]
}

const reverseSection = (genes: Action[], start: number, end: number) => {
  const newGenes: Action[] = [];
  const slice = genes.slice(start, end + 1);
  slice.reverse();
  for (let i = 0; i < genes.length; i++) {
    if (i < start || i > end) newGenes.push(genes[i]);
    else newGenes.push(slice[i - start]);
  }
  return newGenes;
}

const crossOver = (parentA: Action[], parentB: Action[]): Action[] => {
  const point = _.random(2, parentA.length - 2)
  const child = parentA.slice(0, point);
  for (let i = 0; i < parentB.length; i++) {
    const action = parentB[i]
    if (!child.includes(action)) child.push(action);
  }
  return child
}

const mutate = (genes: Action[]): Action[] => {
  if (genes.length == 1) return genes
  // Swap two adjacent points
  if (Math.random() < mutationRate) {
    const indexA = Math.floor(Math.random() * genes.length);
    let indexB = indexA + 1;
    if (indexB >= genes.length) indexB = indexA - 1;
    genes = swapGenes(genes, indexA, indexB)
  }

  // Swap two random points (swap mutation)
  if (Math.random() < mutationRate) {
    const [indexA, indexB] = getRandomIndexes(genes.length);
    genes = swapGenes(genes, indexA, indexB)
  }

  // Reverse a random subsection of the actions (inversion mutation)
  if (Math.random() < 0.01) {
    const [indexA, indexB] = getRandomIndexes(genes.length)
    const start = Math.min(indexA, indexB)
    const end = Math.max(indexA, indexB)
    genes = reverseSection(genes, start, end)
  }

  return genes
}

const newGeneration = () => {
  const newPopulation: Action[][] = []
  for (let i = 0; i < population.length; i++) {
    const parentA = tournamentSelection()
    const parentB = tournamentSelection()
    let child = crossOver(parentA, parentB)
    child = mutate(child)
    newPopulation.push(child)
  }
  population = [...newPopulation]
  currentGenerations++
  console.log(`GENERATION ${currentGenerations} of ${maxGenerations}`)
}

const getBestGenesOfGeneration = (): Action[] => {
  // TODO: cache fitness score
  const sorted = [...population].sort((genesA, genesB) => calcSolutionFitness(genesA) - calcSolutionFitness(genesB))
  return sorted[0];
}

const printMoves = (actions: Action[]) => {
  for (let i = 0; i < trains.length; i++) {
    const trainActions = actions.filter(action => action.train.name === trains[i].name)
    if (trainActions.length === 0) continue
    let currentWeight = 0
    actions.forEach(action => {
      let currentNode = action.train.at.name
      if (action.type === ActionType.LOAD) {
        const dest = action.parcel.at.name
        const nodes = graph.shortestPath(currentNode, dest)
        for (let j = 1; j < nodes.length; j++) {
          const node = nodes[j]
          const cost = graph.getEdgeWeight(currentNode, node)
          console.log(`move ${trains[i].name} from ${currentNode} to ${node} takes ${cost} minutes`)
          currentNode = node
        }
        currentWeight += action.parcel.weight
        console.log(`train ${trains[i].name} load parcel ${action.parcel.name} weight ${action.parcel.weight} kgs (train capacity ${currentWeight}/${trains[i].capacity} kgs)`)
      } else {
        const dest = action.parcel.dest.name
        const nodes = graph.shortestPath(currentNode, dest)
        for (let j = 1; j < nodes.length; j++) {
          const node = nodes[j]
          const cost = graph.getEdgeWeight(currentNode, node)
          console.log(`move ${trains[i].name} from ${currentNode} to ${node} takes ${cost} minutes`)
          currentNode = node
        }
        currentWeight -= action.parcel.weight
        console.log(`train ${trains[i].name} unload parcel ${action.parcel.name} weight ${action.parcel.weight} kgs (train capacity ${currentWeight}/${trains[i].capacity} kgs)`)
      }
    })
  }
}

generateRandomSolution()

let bestGenes
while (currentGenerations < maxGenerations) {
  newGeneration()
  bestGenes = getBestGenesOfGeneration()
  console.log(`CURRENT BEST ${calcSolutionFitness(bestGenes)}`)
}

printMoves(bestGenes)