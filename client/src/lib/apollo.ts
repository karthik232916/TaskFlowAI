import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'

import { store } from '../store/store'

const httpLink = new HttpLink({
  uri: 'http://localhost:5109/graphql',
})

const authLink = new SetContextLink((prevContext) => {
  const token = store.getState().auth.token

  return {
    headers: {
      ...prevContext.headers,
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})