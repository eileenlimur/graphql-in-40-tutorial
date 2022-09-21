const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType, //GraphQL is heavily typed, hence need to import types
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull, //Makes it so cannot return null value for particular type
} = require("graphql");
const app = express();

//faketabase
const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

//schema is required to show server
//Hello world schema practice:
const schemaPractice = new GraphQLSchema({
  // To call the bellow, use
  // query {
  //   message
  // }
  // or
  // {
  //     message
  // }
  // as 'query' is default
  query: new GraphQLObjectType({
    name: "HelloWorld",
    fields: () => ({
      message: { type: GraphQLString, resolve: () => "Hello World" },
    }),
  }),
});

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
      //does not need a resolve function because the object being pulled from (books) already has the id property
    },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: {
      type: GraphQLNonNull(GraphQLInt),
    },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents an author of a book",
  //reason why fields returns a function instead of an object:
  // because AuthorType uses BookType and vice versa and these
  // types need to be defined before getting called
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

//example query of below:
//{
// books {
//     name
//   }
// }
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    // {
    //   book(id: 1) {
    //     name
    //     author {
    //       name
    //     }
    //   }
    // }
    book: {
      type: BookType,
      description: "A Single book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    author: {
      type: AuthorType,
      description: "A Single author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of all Books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of all Authors",
      resolve: () => authors,
    },
  }),
});

const rootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    //example
    // mutation {
    //   addBook(name: "New Name", authorId: 1) {
    //     name
    //     id
    //   }
    // }
    addBook: {
      type: BookType,
      description: "Add a book",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Add an author",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: rootMutationType,
});

//graphiql: true shows user interface
app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));
//basic server
app.listen(5000, () => console.log("Server Running"));
