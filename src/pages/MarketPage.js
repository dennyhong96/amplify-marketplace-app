import React from "react";

const MarketPage = ({ match }) => {
  return <div>{match.params.marketId}</div>;
};

export default MarketPage;
