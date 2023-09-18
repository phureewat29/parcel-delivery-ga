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
      distance += graph.shortestPath(trainStartPoint, dest.name).weight || Number.MAX_SAFE_INTEGER
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

    // Reverse a random subsection of the actions (inversion mutation)
    if (Math.random() < 0.01) {
      const [indexA, indexB] = getRandomIndexes(this.actions.length)
      const start = Math.min(indexA, indexB)
      const end = Math.max(indexA, indexB)
      this.actions = reverseSection(this.actions, start, end)
      return
    }
  }

  /**
   * Print out the moves solution to console
   */
  printMoves(trains: Train[], graph: any) {
    for (let i = 0; i < trains.length; i++) {
      const trainActions = this.actions.filter(action => action.train.name === trains[i].name)
      if (trainActions.length === 0) continue
      let currentWeight = 0
      trainActions.forEach(action => {
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
}
