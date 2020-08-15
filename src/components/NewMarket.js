import React, { Fragment, useState, useContext } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createMarket } from "../graphql/mutations";

import UserContext from "../UserContext";

const NewMarket = ({
  searchText,
  handleSearchChange,
  handleClearSearch,
  handleSearch,
  searching,
}) => {
  const [marketName, setMarketName] = useState("");
  const value = useContext(UserContext);
  const [checked, setChecked] = useState([]);

  const tags = ["Tech", "Education", "Arts", "Family", "Entertaiment"];

  const handleSubmit = async () => {
    const input = {
      name: marketName,
      owner: value.user.username,
      tags: checked,
    };
    try {
      const res = await API.graphql(graphqlOperation(createMarket, { input }));
      console.log(res.data);
      setMarketName("");
      setChecked([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChecked = (evt) => {
    evt.persist();
    if (checked.includes(evt.target.value)) {
      setChecked((prev) => prev.filter((tag) => tag !== evt.target.value));
    } else {
      setChecked((prev) => [...prev, evt.target.value]);
    }
  };

  return (
    <Fragment>
      <h1>Create Your MarketPlace</h1>
      <button
        type="button"
        className="btn btn-primary btn-sm mb-3"
        data-toggle="modal"
        data-target="#exampleModal"
      >
        Add Market
      </button>
      {/* Search */}
      {searching ? (
        <div className="mb-3">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <form className="form-inline mb-3" onSubmit={handleSearch}>
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              placeholder="search..."
              value={searchText}
              onChange={(evt) => handleSearchChange(evt.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-outline-primary ml-1">
            Search
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary ml-1"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </form>
      )}
      {/* Modal */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="addMarketModal"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addMarketModal">
                Create new market
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {/* Form */}
              <div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="marketName"
                    placeholder="Market Name"
                    value={marketName}
                    onChange={(evt) => setMarketName(evt.target.value)}
                  />
                </div>
                <p className="mb-1">
                  <strong>Tags:</strong>
                  <small className="text-muted ml-1">
                    (Select all that apply)
                  </small>
                </p>
                {tags.map((tag, idx) => (
                  <div key={`${tag}${idx}`} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={tag}
                      id={`${tag}${idx}`}
                      checked={checked.includes(tag)}
                      onChange={handleChecked}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`${tag}${idx}`}
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                data-dismiss="modal"
              >
                Cancel
              </button>
              <button
                disabled={!marketName}
                type="button"
                className="btn btn-primary btn-sm"
                data-dismiss="modal"
                onClick={handleSubmit}
              >
                Create Market
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default NewMarket;
