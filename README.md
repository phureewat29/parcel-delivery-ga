# Parcel Delivery using Genetic Algorithm

This project provides a solution for solving the train's delivery code challenge. The solution is based on a Genetic Algorithm (GA) which evolves over generations to find the most efficient sequence of actions (LOAD and UNLOAD) for each train, ensuring the parcels reach their destinations with minimal cost.

![big-train-demo](https://github.com/phureewat29/parcel-delivery-ga/assets/2357480/588a35ee-e9ef-4b5a-b548-e0771a5d18ed)


## Overview

The project is structured around the following main components:

- **Nodes**: These represent locations where trains and parcels can be.
- **Edges**: Represent the routes between two nodes and their associated distance.
- **Trains**: Have capacities and are located at nodes.
- **Parcels**: Have weights and are associated with source and destination nodes.
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
