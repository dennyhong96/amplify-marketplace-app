import React, { useContext, useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";

import UserContext from "../UserContext";
import { centesToDollar } from "../utils/index";

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders(sortDirection: DESC, limit: 999) {
        items {
          id
          createdAt
          updatedAt
          product {
            id
            owner
            price
            createdAt
            description
          }
          shippingAddress {
            city
            country
            address_line1
            address_state
            address_zip
          }
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

const ProfilePage = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const res = await API.graphql(
            graphqlOperation(getUser, { id: user.attributes.sub })
          );
          console.log(res.data);
          setOrders(res.data.getUser.orders.items);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, []);

  return (
    <div className="row pt-2">
      <div className="col-3">
        <div
          className="nav flex-column nav-pills"
          id="v-pills-tab"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            className="nav-link active"
            id="v-pills-home-tab"
            data-toggle="pill"
            href="#v-pills-home"
            role="tab"
            aria-controls="v-pills-home"
            aria-selected="true"
          >
            Summary
          </a>
          <a
            className="nav-link"
            id="v-pills-profile-tab"
            data-toggle="pill"
            href="#v-pills-profile"
            role="tab"
            aria-controls="v-pills-profile"
            aria-selected="false"
          >
            Orders
          </a>
          <a
            className="nav-link"
            id="v-pills-messages-tab"
            data-toggle="pill"
            href="#v-pills-messages"
            role="tab"
            aria-controls="v-pills-messages"
            aria-selected="false"
          >
            Messages
          </a>
          <a
            className="nav-link"
            id="v-pills-settings-tab"
            data-toggle="pill"
            href="#v-pills-settings"
            role="tab"
            aria-controls="v-pills-settings"
            aria-selected="false"
          >
            Settings
          </a>
        </div>
      </div>
      <div className="col-9">
        <div className="tab-content" id="v-pills-tabContent">
          <div
            className="tab-pane fade show active"
            id="v-pills-home"
            role="tabpanel"
            aria-labelledby="v-pills-home-tab"
          >
            <h2>Profile Summary</h2>
            <p>ID: {user.attributes.sub}</p>
            <p>Username: {user.username}</p>
            <p>
              Email: {user.attributes.email}{" "}
              <button className="btn btn-outline-warning btn-sm">Edit</button>
            </p>
            <p>
              Email Verified?{" "}
              <strong>{user.attributes.email_verified ? "Yes" : "No"}</strong>
            </p>
            <p>Phone: {user.attributes.phone_number}</p>
            <button className="btn btn-outline-danger btn-sm">
              Delete Profile
            </button>
          </div>
          <div
            className="tab-pane fade"
            id="v-pills-profile"
            role="tabpanel"
            aria-labelledby="v-pills-profile-tab"
          >
            <h2>Order History</h2>
            {!!orders.length &&
              orders.map((order) => (
                <div key={order.id} className="card card-body mb-2">
                  <p className="mb-1">Order ID: {order.id}</p>
                  <p className="mb-1">
                    Order Description: {order.product.description}
                  </p>
                  <p className="mb-1">
                    Order Price: ${centesToDollar(order.product.price)}
                  </p>
                  <p className="mb-1">Purchased On: {order.createdAt}</p>
                  <p className="mb-1">
                    Delivery Method:{" "}
                    {order.product.shipped ? "Shipment" : "Email"}
                  </p>
                </div>
              ))}
          </div>
          <div
            className="tab-pane fade"
            id="v-pills-messages"
            role="tabpanel"
            aria-labelledby="v-pills-messages-tab"
          >
            ...
          </div>
          <div
            className="tab-pane fade"
            id="v-pills-settings"
            role="tabpanel"
            aria-labelledby="v-pills-settings-tab"
          >
            ...
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
