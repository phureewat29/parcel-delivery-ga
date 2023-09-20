import _ from "lodash";
import { Action, ActionType, Parcel, Train } from "./types";

export class Member {
  actions: Action[]
  fitness: number = 0
  penalty: number = 0
  distance: number = 0

  constructor(actions: Action[]) {
    this.actions = actions
  }

  static generateRandomSolution(trains: Train[], parcels: Parcel[]): Member {
    let randomActions: Action[] = []
    parcels.map(parcel => {
      const train = _.sample(trains) || trains[0]
      randomActions.push({ type: ActionType.LOAD, parcel, train })
      randomActions.push({ type: ActionType.UNLOAD, parcel, train })
    })
    randomActions = _.shuffle(randomActions)
    return new Member(randomActions)
  }

  calcSolutionFitness(trains: Train[], parcels: Parcel[], graph: any) {
    let distance: number = 0
    let penalty: number = 0
    let pendingDeliver: string[] = _(parcels).map('name').uniq().value()
    let delieverd: string[] = []

    for (let i = 0; i < trains.length; i++) {
      const train = trains[i]
      const trainActions = this.actions.filter(action => action.train.name === train.name)
      if (trainActions.length === 0) continue
      distance += Member.calcRouteFitness(trainActions, graph)
      penalty += Member.calcRouteOverload(trainActions, train.capacity)

      const deliverByThisTrain = _(trainActions).map('parcel.name').uniq().value()
      penalty += _.intersection(delieverd, deliverByThisTrain).length // penalty for delivering the same parcel twice
      delieverd = _.union(delieverd, deliverByThisTrain)
      pendingDeliver = _.difference(pendingDeliver, deliverByThisTrain)
    }
    penalty += pendingDeliver.length // penalty for not delivering all parcels
    penalty *= 1000
    this.distance = distance
    this.penalty = penalty
    this.fitness = this.distance + this.penalty
  }

  static calcRouteFitness(actions: Action[], graph: any): number {
    let distance: number = 0
    let currentAt = actions[0].train.at.name

    for (let i = 0; i < actions.length; i++) {
      const dest = actions[i].type === ActionType.LOAD ? actions[i].parcel.at : actions[i].parcel.dest
      distance += graph.shortestPath(currentAt, dest.name).weight || 0
      currentAt = dest.name
    }
    return distance
  }

  /**
   * Penalty the overload and impossible parcels delivery
   */
  static calcRouteOverload(actions: Action[], maxCapacity: number): number {
    let overload: number = 0
    let currentWeight: number = 0
    let parcelStorage: string[] = []
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

  mutate(mutationRate: number,) {
    // Mutatation utils
    const swapActions = (actions: Action[], a: number, b: number) => {
      const temp = actions[b]
      actions[b] = actions[a]
      actions[a] = temp
      return actions
    }

    // Swap two random action within the same train
    if (Math.random() < mutationRate) {
      const actionA = _.sample(this.actions)
      if (!actionA) return
      const actionB = _(this.actions).shuffle().find(a => a.train === actionA.train && a.parcel != actionA.parcel)
      if (!actionB) return
      this.actions = swapActions(this.actions, this.actions.indexOf(actionA), this.actions.indexOf(actionB))
      return
    }

    // Swap delivery order of two random parcels within the same train
    if (Math.random() < mutationRate) {
      const actionA = _.sample(this.actions)
      if (!actionA) return
      const actionB = _(this.actions).filter(a => a.train === actionA.train && a.parcel != actionA.parcel).sample()
      if (!actionB) return

      const loadParcelA = _.find(this.actions, { parcel: actionA.parcel, type: ActionType.LOAD })
      const loadParcelB = _.find(this.actions, { parcel: actionB.parcel, type: ActionType.LOAD })
      const unloadParcelA = _.find(this.actions, { parcel: actionA.parcel, type: ActionType.UNLOAD })
      const unloadParcelB = _.find(this.actions, { parcel: actionB.parcel, type: ActionType.UNLOAD })
      if (!loadParcelA || !loadParcelB || !unloadParcelA || !unloadParcelB) return

      this.actions = swapActions(this.actions, this.actions.indexOf(loadParcelA), this.actions.indexOf(loadParcelB))
      this.actions = swapActions(this.actions, this.actions.indexOf(unloadParcelA), this.actions.indexOf(unloadParcelB))

      return
    }

    // Shuffle genese
    if (Math.random() < mutationRate) {
      this.actions = _.shuffle(this.actions)
    }
  }

  /**
   * Print out the moves solution to console
   */
  printSolution(trains: Train[], graph: any) {
    console.log(`\n\nSOLUTION:`)

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

    console.log(`\nFITNESS SCORE: ${this.fitness}, TOTAL DISTANCE: ${this.distance}, PENALTY: ${this.penalty}`)
  }
}
