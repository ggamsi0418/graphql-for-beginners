import { ApolloServer, gql } from "apollo-server";

let tweets = [
  {
    id: "1",
    text: "first one",
    userId: "1",
  },

  {
    id: "2",
    text: "second one",
    userId: "2",
  },
];

let users = [
  {
    id: "1",
    firstName: "jungbin",
    lastName: "park",
  },
  {
    id: "2",
    firstName: "nico",
    lastName: "las",
  },
];

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    """
    Is the sum of firstName + lastName as a string
    """
    fullName: String!
  }

  """
  Tweet object represents a resource for a Tweet
  """
  type Tweet {
    id: ID!
    text: String!
    author: User!
  }

  type Query {
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    allMovies: [Movie!]!
    movie(id: Int!): Movie
  }

  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    """
    Deletes a Tweet if found, else returns false
    """
    deleteTweet(id: ID!): Boolean!
  }

  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: Int!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String!]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    mpa_rating: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;

const resolvers = {
  Query: {
    allUsers() {
      console.log("get all users!");

      const orderedUsers = users.sort((a, b) => {
        return +b.id - +a.id;
      });

      return orderedUsers;
    },

    allTweets() {
      console.log("get all tweets!");

      const orderedTweets = tweets.sort((a, b) => {
        return +b.id - +a.id;
      }); // tweet의 id를 기준으로 내림차순 정렬
      return orderedTweets;
    },

    tweet(__, { id }, contextValue, info) {
      console.log(`get tweet(id: ${id})`);
      return tweets.find((tweet) => tweet.id === id);
    },
    allMovies() {
      return fetch("https://yts.mx/api/v2/list_movies.json")
        .then((r) => r.json())
        .then((json) => json.data.movies);
    },
    movie(__, { id }) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((r) => r.json())
        .then((json) => json.data.movie);
    },
  },
  Mutation: {
    postTweet(__, { text, userId }) {
      const user = users.find((user) => user.id === userId);

      if (!user) return null;

      const orderedTweets = tweets.sort((a, b) => {
        return +b.id - +a.id;
      }); // tweet의 id를 기준으로 내림차순 정렬

      const newTweet = {
        id: (+orderedTweets[0].id + 1).toString(),
        text,
        userId,
      };

      tweets.push(newTweet);

      console.log("add tweet!");

      return newTweet;
    },
    deleteTweet(__, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);

      if (!tweet) return false;

      tweets = tweets.filter((tweet) => tweet.id !== id);

      console.log("delete tweet!");
      return true;
    },
  },
  User: {
    fullName({ lastName, firstName }) {
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
