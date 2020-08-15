import React, { useEffect, useState, useRef } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { listMarkets } from "../graphql/queries";
import { Link } from "react-router-dom";
import { onCreateMarket } from "../graphql/subscriptions";

const MarketList = ({ searchResults }) => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const marketsRef = useRef();

  useEffect(() => {
    const createMarketSub = API.graphql(
      graphqlOperation(onCreateMarket)
    ).subscribe({
      next: (marketData) => {
        setMarkets((prev) => {
          const nextState = [marketData.value.data.onCreateMarket, ...prev];
          marketsRef.current = nextState;
          return nextState;
        });
      },
    });
    return () => {
      createMarketSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (searchResults.length) {
      setMarkets(searchResults);
    } else if (marketsRef.current) {
      setMarkets(marketsRef.current);
    } else {
      (async () => {
        setLoading(true);
        try {
          const res = await API.graphql(graphqlOperation(listMarkets));
          setMarkets(res.data.listMarkets.items);
          marketsRef.current = res.data.listMarkets.items;
        } catch (error) {
          console.error(error);
        }
        setLoading(false);
      })();
    }
  }, [searchResults]);

  return loading ? (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  ) : (
    <div>
      {markets.map((market) => (
        <div className="card card-body mb-2" key={market.id}>
          <div className="row">
            <div className="col-3">
              <strong>Market:</strong> {market.name}
            </div>
            <div className="col-5">
              <strong>Tags:</strong>{" "}
              {market.tags ? market.tags.join(", ") : "N/A"}
            </div>
            <div className="col-3">
              <strong>Owner:</strong> {market.owner}
            </div>
            <div className="col-1">
              <Link to={`/markets/${market.id}`}>Go</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketList;
