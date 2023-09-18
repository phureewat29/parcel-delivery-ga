import _ from "lodash";
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

  /**
   * Penalty the overload and impossible parcels delivery
   */
  static calcTrainRouteOverload(actions: Action[], maxCapacity: number): number {
    let overload = 0
    let currentWeight = 0;
    let parcelStorage: string[] = [];
    for (let i = 0; i < actions.length; i++) {
      if (actions[i].type === ActionType.LOAD) {
        currentWeight += actions[i].parcel.weight
        parcelStorage.push(actions[i].parcel.name)
      } else {
        currentWeight -= actions[i].parcel.weight
        if (parcelStorage.includes(actions[i].parcel.name)) parcelStorage.splice(parcelStorage.indexOf(actions[i].parcel.name), 1)
      }
      if (currentWeight < 0 || currentWeight > maxCapacity) overload++
    }

    overload += parcelStorage.length
    return overload
  }

  mutate(mutationRate: number, possibleActions: Action[]) {
    // Mutatation utils
    const swapActions = (actions: Action[], a: number, b: number) => {
      const temp = actions[b]
      actions[b] = actions[a]
      actions[a] = temp
      return actions
    }

    const getRandomIndexes = (max: number): [number, number] => {
      const indexA = Math.floor(Math.random() * max);
      let indexB = Math.floor(Math.random() * max);
      if (indexA === indexB) indexB >= max - 1 ? indexB-- : indexB++;
      return [indexA, indexB]
    }

    // Swap with another posible action
    if (Math.random() < mutationRate) {
      const indexA = Math.floor(Math.random() * this.actions.length);
      this.actions[indexA] = _.find(possibleActions, action => !this.actions.includes(action)) || this.actions[indexA]
      return
    }

    // Swap two adjacent points
    if (Math.random() < mutationRate) {
      const indexA = Math.floor(Math.random() * this.actions.length);
      let indexB = indexA + 1;
      if (indexB >= this.actions.length) indexB = indexA - 1;
      this.actions = swapActions(this.actions, indexA, indexB)
      return
    }

    // Swap two random points (swap mutation)
    if (Math.random() < mutationRate) {
      const [indexA, indexB] = getRandomIndexes(this.actions.length);
      this.actions = swapActions(this.actions, indexA, indexB)
      return
    }
  }

  /**
   * Print out the moves solution to console
   */
  printSolution(trains: Train[], graph: any) {
    _(this.actions).groupBy('train.name').map((actions, trainName) => {
      let currentWeight = 0
      const train = _.find(trains, { name: trainName })
      console.log(`\nTRAIN: ${train?.name} at ${train?.at.name}`)
      let currentNode = train?.at.name
      _.map(actions, action => {
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
    }).value()
  }
}
