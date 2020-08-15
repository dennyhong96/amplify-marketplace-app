import React, { Fragment, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";

import { searchMarkets } from "../graphql/queries";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";

const HomePage = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  const handleSearch = async (evt) => {
    evt.preventDefault();
    console.log(searchText);

    try {
      setSearching(true);
      const res = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchText } },
              { owner: { match: searchText } },
              { tags: { match: searchText } },
            ],
          },
          sort: {
            field: "createdAt",
            direction: "desc",
          },
        })
      );
      console.log(res.data);
      setSearchResults(res.data.searchMarkets.items);
    } catch (error) {
      console.error(error);
    }
    setSearching(false);
  };

  return (
    <Fragment>
      <NewMarket
        searchText={searchText}
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
        handleSearch={handleSearch}
        searching={searching}
      />
      <MarketList searchResults={searchResults} />
    </Fragment>
  );
};

export default HomePage;
