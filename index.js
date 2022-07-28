import { ApolloServer, UserInputError, gql } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import {v1 as uuid} from 'uuid'

const persons = [
  {
    name: "Jota",
    phone: "1234567",
    street: "Manolito Trentaitreh",
    city: "Sevilla city",
    id: "1"
  },
  {
    name: "Elver",
    street: "Juanjose",
    city: "Huelva",
    id: "2"
  },
  {
    name: "Kerry",
    phone: "8987495",
    street: "Kopo",
    city: "Marbella",
    id: "3"
  },
]

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String
    city: String
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }

  type Mutation {
    editNumer(
      name: String!
      phone: String!
    ): Person
  }
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if (!args.phone) return persons

      const byPhone = person => 
        args.phone === "YES" ? person.phone : !person.phone

      return persons.filter(byPhone)
    },

    findPerson: (root, args) => {
      const { name } = args
      return persons.find(person => person.name === name)
    }
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find(p => p.name === args.name)) {
        throw new UserInputError('name must be unique', {
          invalidArgs: args.name
        })
      }
      const person = {...args, id: uuid()}
      persons.push(person)
      return person
    },
    editNumer: (root, args) => {
      const personIndex = persons.findIndex(p => p.name === args.name)
      if (!personIndex === -1) return null

      const person = persons[personIndex]

      const updatedPerson = {...person, phone: args.phone}
      persons[personIndex] = updatedPerson

      return updatedPerson
    }
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

server.listen().then(({ url }) => console.log(`Server ready at ${url}`))