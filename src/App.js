import React, { useEffect, useState } from "react";
import { Auth, API, graphqlOperation } from "aws-amplify";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import { AmplifyAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { getUser } from "./graphql/queries";
import { registerUser } from "./graphql/mutations";
import UserContext from "./UserContext";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import Navbar from "./components/Navbar";
import "./App.css";

const App = () => {
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    if (authState === "signedin" && user) {
      console.log(user);
      (async () => {
        try {
          const {
            data: { getUser: existingUser },
          } = await API.graphql(
            graphqlOperation(getUser, { id: user.attributes.sub })
          );
          console.log(existingUser);
          if (!existingUser) {
            const input = {
              id: user.attributes.sub,
              username: user.username,
              email: user.attributes.email,
              registered: true,
            };
            const res = await API.graphql(
              graphqlOperation(registerUser, { input })
            );
            console.log(res.data);
          }
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [authState, user]);

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  return authState === AuthState.SignedIn && user ? (
    <UserContext.Provider value={{ user }}>
      <BrowserRouter>
        {/* Navbar */}
        <Navbar user={user} signOut={() => Auth.signOut()} />
        <div className="container">
          {/* Routes */}
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/profile" component={ProfilePage} />
            <Route
              exact
              path="/markets/:marketId"
              component={(routeProps) => (
                <MarketPage {...routeProps} user={user} />
              )}
            />
          </Switch>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  ) : (
    <AmplifyAuthenticator />
  );
};

export default App;
