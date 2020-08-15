import React, { useEffect, useState } from "react";
import { Auth } from "aws-amplify";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import { AmplifyAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

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
    console.log(authState, user);
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
