import _, { random } from "lodash";
import { Action, ActionType, Parcel, Train } from "./types";

export class Member {
  actions: Action[]
  fitness: number = 0
  overload: number = 0
  distance: number = 0

  constructor(actions: Action[]) {
    this.actions = actions
  }

  static generateRandomSolution(possibleActions: Action[], actionsLength: number): Member {
    const randomActions = _.shuffle(possibleActions).slice(0, actionsLength)
    return new Member(randomActions)
  }

  calcSolutionFitness(trains: Train[], graph: any) {
    let distance = 0;
    let overload = 0;

    for (let i = 0; i < trains.length; i++) {
      const train = trains[i]
      const trainActions = this.actions.filter(action => action.train.name === train.name)
      if (trainActions.length === 0) continue
      distance += Member.calcTrainRouteFitness(trainActions, graph)
      overload += Member.calcTrainRouteOverload(trainActions, train.capacity)
    }

    overload *= 1000
    this.distance = distance
    this.overload = overload
    this.fitness = this.distance + this.overload
  }

  static calcTrainRouteFitness(actions: Action[], graph: any): number {
    let distance = 0
    let trainStartPoint = actions[0].train.at.name

    for (let i = 0; i < actions.length; i++) {
      const dest = actions[i].type === ActionType.LOAD ? actions[i].parcel.at : actions[i].parcel.dest
      distance += graph.shortestPath(trainStartPoint, dest.name).weight || 0
    }
    return distance
  }

  static calcTrainRouteOverload(actions: Action[], maxCapacity: number): number {
    let overload = 0

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

  mutate(mutationRate: number) {
    if (this.actions.length == 1) return

    // Mutatation utils
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

    // Swap two adjacent points
    if (Math.random() < mutationRate) {
      const indexA = Math.floor(Math.random() * this.actions.length);
      let indexB = indexA + 1;
      if (indexB >= this.actions.length) indexB = indexA - 1;
      this.actions = swapGenes(this.actions, indexA, indexB)
      return
    }

    // Swap two random points (swap mutation)
    if (Math.random() < mutationRate) {
      const [indexA, indexB] = getRandomIndexes(this.actions.length);
      this.actions = swapGenes(this.actions, indexA, indexB)
      return
    }
  }

  /**
   * Print out the moves solution to console
   */
  printSolution(trains: Train[], graph: any) {
    const trainActions = _.groupBy(this.actions, 'train.name')

    _.map(trainActions, (actions, trainName) => {
      let currentWeight = 0
      const train = _.find(trains, { name: trainName })
      console.log(`\nTRAIN: ${train?.name} at ${train?.at.name}`)
      let currentNode = train?.at.name
      actions.map(action => {
        let isLoad = action.type === ActionType.LOAD
        let dest = isLoad ? action.parcel.at.name : action.parcel.dest.name
        const nodes = graph.shortestPath(currentNode, dest)
        for (let i = 1; i < nodes.length; i++) {
          const node = nodes[i]
          const cost = graph.getEdgeWeight(currentNode, node)
          console.log(`move ${currentNode} -> ${node} takes ${cost} minutes`)
          currentNode = node
        }
        currentWeight = isLoad ? currentWeight + action.parcel.weight : currentWeight - action.parcel.weight
        console.log(`${isLoad ? 'load' : 'unload'} ${action.parcel.name} weight ${action.parcel.weight} kgs (capacity ${currentWeight}/${train?.capacity} kgs)`)
      })
    })
  }
}
