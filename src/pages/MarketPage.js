import React, { useEffect, useState, Fragment } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { Link } from "react-router-dom";

import NewProduct from "../components/NewProduct";
import Product from "../components/Product";
import {
  onCreateProduct,
  onDeleteProduct,
  onUpdateProduct,
} from "../graphql/subscriptions";

const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      tags
      owner
      products {
        items {
          id
          description
          price
          shipped
          owner
          createdAt
          updatedAt
          file {
            key
          }
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const MarketPage = ({ match, user }) => {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.graphql(
          graphqlOperation(getMarket, { id: match.params.marketId })
        );
        setMarket(res.data.getMarket);
        if (user && user.username === res.data.getMarket.owner) {
          setIsOwner(true);
        }
        console.log(res.data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    })();
  }, [match.params.marketId]);

  useEffect(() => {
    let createProductSub;
    let updateProductSub;
    let deleteProductSub;
    (async () => {
      try {
        createProductSub = API.graphql(
          graphqlOperation(onCreateProduct, { owner: user.attributes.sub })
        ).subscribe({
          next: (productData) => {
            const createdProduct = productData.value.data.onCreateProduct;
            setMarket((prev) => ({
              ...prev,
              products: {
                ...prev.products,
                items: [createdProduct, ...prev.products.items],
              },
            }));
          },
        });

        updateProductSub = API.graphql(
          graphqlOperation(onUpdateProduct, { owner: user.attributes.sub })
        ).subscribe({
          next: (productData) => {
            const updatedProduct = productData.value.data.onUpdateProduct;
            setMarket((prev) => ({
              ...prev,
              products: {
                ...prev.products,
                items: prev.products.items.map((item) =>
                  item.id === updatedProduct.id ? updatedProduct : item
                ),
              },
            }));
          },
        });

        deleteProductSub = API.graphql(
          graphqlOperation(onDeleteProduct, { owner: user.attributes.sub })
        ).subscribe({
          next: (productData) => {
            const deleteProduct = productData.value.data.onDeleteProduct;
            setMarket((prev) => ({
              ...prev,
              products: {
                ...prev.products,
                items: prev.products.items.filter(
                  (item) => item.id !== deleteProduct.id
                ),
              },
            }));
          },
        });
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      createProductSub.unsubscribe();
      updateProductSub.unsubscribe();
      deleteProductSub.unsubscribe();
    };
  }, []);

  return loading ? (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  ) : (
    // Link
    <Fragment>
      <Link to="/">Back to markets list</Link>
      <div>
        <h2 className="d-inline">{market.name}</h2>
        <p className="d-inline"> - {market.owner}</p>
        <p>{market.createdAt}</p>
      </div>

      {isOwner && (
        <div className="">
          {/* New Product */}
          <NewProduct marketId={match.params.marketId} />
        </div>
      )}
      {/* Products List */}
      <h2>Products</h2>
      <div className="d-flex flex-wrap">
        {market.products.items.map((product) => (
          <Product key={product.id} product={product} user={user} />
        ))}
      </div>
    </Fragment>
  );
};

export default MarketPage;
