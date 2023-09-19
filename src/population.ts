import { Node, Edge, Train, Parcel, Action, ActionType } from './types'
import _ from 'lodash'
import { Member } from './member';
import Graph from 'graph-data-structure'

export class Population {
  // GA Settings
  population: Member[] = [];
  populationSize: number
  tournamentSize: number
  mutationRate: number
  generations: number = 0

  possibleActions: Action[] = [];
  maxGenesLength: number
  trains: Train[]
  parcels: Parcel[]
  graph = Graph()

  constructor(
    populationSize: number,
    tournamentSize: number,
    mutationRate: number,
    nodes: Node[],
    edges: Edge[],
    trains: Train[],
    parcels: Parcel[]
  ) {
    this.populationSize = populationSize
    this.tournamentSize = tournamentSize
    this.mutationRate = mutationRate
    this.trains = trains
    this.parcels = parcels
    this.maxGenesLength = Math.max(2, trains.length * parcels.length)

    this.buildGraph(nodes, edges)
    this.generatePossibleActions()

    for (let i = 0; i < populationSize; i++) {
      const randomSolution = Member.generateRandomSolution(this.trains, this.parcels)
      this.population.push(randomSolution)
    }
  }

  buildGraph(nodes: Node[], edges: Edge[]) {
    nodes.forEach(node => this.graph.addNode(node.name))
    edges.forEach(edge => {
      this.graph.addEdge(edge.from.name, edge.to.name, edge.distance)
      this.graph.addEdge(edge.to.name, edge.from.name, edge.distance)
    })
  }

  generatePossibleActions() {
    this.trains.map(train => {
      this.parcels.map(parcel => {
        this.possibleActions.push({ type: ActionType.LOAD, parcel, train })
        this.possibleActions.push({ type: ActionType.UNLOAD, parcel, train })
      })
    })
  }

  calcAllFitnessValues() {
    for (let i = 0; i < this.population.length; i++) {
      this.population[i].calcSolutionFitness(this.trains, this.parcels, this.graph)
    }
  }

  newGeneration() {
    const newPopulation: Member[] = []
    for (let i = 0; i < this.population.length; i++) {
      const parentA = this.tournamentSelection()
      const parentB = this.tournamentSelection()
      let child = this.crossOver(parentA, parentB)
      child.mutate(this.mutationRate)
      newPopulation.push(child)
    }
    this.population = [...newPopulation]
    this.generations++
  }

  tournamentSelection(): Member {
    const tournamentPopulation: Member[] = []
    for (let i = 0; i < this.tournamentSize; i++) {
      const randomSolution = this.population[Math.floor(Math.random() * this.population.length)]
      tournamentPopulation.push(randomSolution)
    }
    return tournamentPopulation.sort((memberA, memberB) => memberA.fitness - memberB.fitness)[0]
  }

  /**
   * Cross over two parents genes to create a child
   * Copy parcel delivery route (genes) from random parent
   */
  crossOver(parentA: Member, parentB: Member): Member {
    const newActions: Action[] = []
    _(this.parcels).shuffle().value().forEach(parcel => {
      const parent = _.sample([parentA, parentB])
      const parcelActions = parent.actions.filter(action => action.parcel.name === parcel.name)
      newActions.push(...parcelActions)
    })
    return new Member(newActions)
  }

  getBestMemberOfGeneration(): Member {
    const sorted = [...this.population].sort((memberA, memberB) => memberA.fitness - memberB.fitness)
    return sorted[0];
  }
}