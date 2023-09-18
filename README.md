# Parcel Delivery using Genetic Algorithm

This project provides a solution for solving the train's delivery code challenge. The solution is based on a Genetic Algorithm (GA) which evolves over generations to find the most efficient sequence of actions (LOAD and UNLOAD) for each train, ensuring the parcels reach their destinations with minimal cost.

![big-train-demo](https://github.com/phureewat29/parcel-delivery-ga/assets/2357480/588a35ee-e9ef-4b5a-b548-e0771a5d18ed)

## Solve Simple Problem
**Input (Simple)**
```
const N1 = { name: 'N1' }
const N2 = { name: 'N2' }
const N3 = { name: 'N3' }
const nodes: Node[] = [N1, N2, N3]

const E1 = { name: 'E1', from: N1, to: N2, distance: 30 }
const E2 = { name: 'E2', from: N2, to: N3, distance: 10 }
const edges: Edge[] = [E1, E2]

const T1 = { name: 'T1', capacity: 5, at: N2 }
const trains: Train[] = [T1]

const P1 = { name: 'P1', weight: 5, at: N1, dest: N3 }
const parcels: Parcel[] = [P1]
```

**Output (Simple)**
```
TRAIN: T1 at N2
move N2 -> N1 takes 30 minutes
load P1 weight 5 kgs (capacity 5/5 kgs)
move N1 -> N2 takes 30 minutes
move N2 -> N3 takes 10 minutes
unload P1 weight 5 kgs (capacity 0/5 kgs)
```
## Solve Complex Problem

**Input (Complex)**
```
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

const T1 = { name: 'T1', capacity: 20, at: N2 }
const T2 = { name: 'T2', capacity: 10, at: N5 }
const trains: Train[] = [T1, T2]

const P1 = { name: 'P1', weight: 10, at: N1, dest: N3 }
const P2 = { name: 'P2', weight: 10, at: N2, dest: N3 }
const P3 = { name: 'P3', weight: 10, at: N3, dest: N5 }
const P4 = { name: 'P4', weight: 10, at: N4, dest: N1 }
const parcels: Parcel[] = [P1, P2, P3, P4]
```

**Output (Complex)**
```
TRAIN: T2 at N5
move N5 -> N4 takes 10 minutes
move N4 -> N3 takes 50 minutes
load P3 weight 10 kgs (capacity 10/10 kgs)
move N3 -> N4 takes 50 minutes
move N4 -> N5 takes 10 minutes
unload P3 weight 10 kgs (capacity 0/10 kgs)

TRAIN: T1 at N2
load P2 weight 10 kgs (capacity 10/20 kgs)
move N2 -> N3 takes 10 minutes
load P3 weight 10 kgs (capacity 20/20 kgs)
move N3 -> N4 takes 50 minutes
move N4 -> N5 takes 10 minutes
unload P3 weight 10 kgs (capacity 10/20 kgs)
move N5 -> N4 takes 10 minutes
move N4 -> N3 takes 50 minutes
move N3 -> N2 takes 10 minutes
move N2 -> N1 takes 30 minutes
load P1 weight 10 kgs (capacity 20/20 kgs)
move N1 -> N2 takes 30 minutes
move N2 -> N3 takes 10 minutes
unload P2 weight 10 kgs (capacity 10/20 kgs)
unload P1 weight 10 kgs (capacity 0/20 kgs)
```

## Overview

The project is structured around the following main components:

- **Nodes**: These represent locations where trains and parcels can be.
- **Edges**: Represent the routes between two nodes and their associated distance.
- **Trains**: Have capacities and are located at nodes.
- **Parcels (Packages)**: Have weights and are associated with source and destination nodes.
- **Actions**: Represent the action state of LOAD or UNLOAD parcel from/onto a train.

The GA creates populations of solutions (members), and through selection, crossover, and mutation operations, improves the population towards optimal or near-optimal solutions.

## Installation
### Install dependencies
To install project dependencies, use the following command:
```
bun install
```

## Running the Project
### Start the Project
To run the project and view the results, use the following command:

```
bun start
```
This command initializes the project and runs the Genetic Algorithm to find and display the optimized solution.

### Development Mode
If you're looking to make changes and want to watch the project for any changes you make, use the following command:
```
bun dev
```
This will keep the project running and will reflect any changes made instantly.

## How It Works
The GA uses a population of potential solutions (members). Each member in the population is a sequence of actions representing the loading and unloading of parcels by trains. The GA evolves this population over generations.

1. Initialization: A population of random solutions is generated.
2. Selection: Some of the best-performing solutions are chosen to be parents to produce the members of the next generation.
3. Crossover (Reproduction): Pairs of parents are selected based on their fitness. They produce a "child" solution by combining their sequences of actions.
4. Mutation: To maintain diversity in the population and prevent premature convergence, occasional changes are made to the members.
5. Evaluation: Each member's sequence of actions is evaluated based on the total distance traveled and whether it violates any constraints like overloading the train.
6. This process is repeated for several generations or until a satisfactory solution is found.

## Project Structure
* `app.ts`: This is the main entry point that initializes the data and runs the GA.
* `population.ts`: Defines the Population class, which represents a collection of potential solutions and contains methods to evolve the population over generations.
* `member.ts`: Defines a Member class, representing a single potential solution.
* `types.ts`: Contains type definitions and interfaces used throughout the project.

## License
MIT
