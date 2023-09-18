import { Node, Edge, Train, Parcel, Action, ActionType } from './types'
import * as _ from 'lodash'
import { Member } from './member';
import Graph from 'graph-data-structure'

export class Population {
  // GA Settings
  population: Member[] = [];
  populationSize: number
  tournamentSize: number
  mutationRate: number
  generations: number = 0

  // GA Data
  possibleActions: Action[] = [];
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
    this.tournamentSize = mutationRate
    this.mutationRate = tournamentSize
    this.trains = trains
    this.parcels = parcels

    this.buildGraph(nodes, edges)
    this.generatePossibleActions()

    for (let i = 0; i < populationSize; i++) {
      const randomSolution = Member.generateRandomSolution(this.possibleActions, this.parcels.length * this.trains.length)
      this.population.push(randomSolution)
    }
  }

  buildGraph(nodes: Node[], edges: Edge[]) {
    // bi-directional graph
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
      this.population[i].calcSolutionFitness(this.trains, this.graph)
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

  crossOver(parentA: Member, parentB: Member): Member {
    const point = _.random(2, parentA.actions.length - 2)
    const child = parentA.actions.slice(0, point)
    for (let i = 0; i < parentB.actions.length; i++) {
      const action = parentB.actions[i]
      if (!child.includes(action)) child.push(action);
    }
    return new Member(child)
  }

  getBestMemberOfGeneration(): Member {
    const sorted = [...this.population].sort((memberA, memberB) => memberA.fitness - memberB.fitness)
    return sorted[0];
  }
}