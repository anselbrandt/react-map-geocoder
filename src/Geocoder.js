import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import MapboxClient from "mapbox";
import { WebMercatorViewport } from "viewport-mercator-project";

const Geocoder = ({
  mapboxApiAccessToken,
  timeout,
  queryParams,
  localGeocoder,
  limit,
  localOnly,
  viewport,
  onSelected,
  transitionDuration,
  hideOnSelect,
  pointZoom,
  formatItem,
  updateInputOnSelect,
  className,
  inputComponent,
  itemComponent,
  initialInputValue,
}) => {
  const debounceRef = useRef(null);
  const client = new MapboxClient(mapboxApiAccessToken);
  const Input = inputComponent || "input";
  const Item = itemComponent || "div";

  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleOnChange = (event) => {
    const queryString = event.target.value;
    setInputValue(queryString);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const localResults = localGeocoder ? localGeocoder(queryString) : [];
      const params = {
        ...queryParams,
        ...{ limit: limit - localResults.length },
      };
      if (params.limit > 0 && !localOnly && queryString.length > 0) {
        client.geocodeForward(queryString, params).then((res) => {
          setResults([...localResults, ...res.entity.features]);
        });
      } else {
        setResults(localResults);
      }
    }, timeout);
  };

  const handleOnSelected = (item) => {
    let newViewport = new WebMercatorViewport(viewport);
    const { bbox, center } = item;
    if (bbox) {
      newViewport = newViewport.fitBounds([
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ]);
    } else {
      newViewport = {
        longitude: center[0],
        latitude: center[1],
        zoom: pointZoom,
      };
    }
    const { longitude, latitude, zoom } = newViewport;
    onSelected(
      { ...viewport, ...{ longitude, latitude, zoom, transitionDuration } },
      item
    );
    if (hideOnSelect) {
      setResults([]);
    }
    if (updateInputOnSelect) {
      setInputValue(formatItem(item));
    }
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const handleHideResults = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 300);
  };

  useEffect(() => {
    if (inputValue.length === 0 && initialInputValue !== "") {
      setInputValue(initialInputValue);
    }
  }, [inputValue, initialInputValue]);

  return (
    <div className={`react-geocoder ${className}`}>
      <Input
        onChange={handleOnChange}
        onBlur={handleHideResults}
        onFocus={handleShowResults}
        value={inputValue}
      />

      {showResults && !!results.length && (
        <div className="react-geocoder-results">
          {results.map((item, index) => (
            <Item
              key={index}
              className="react-geocoder-item"
              onClick={() => handleOnSelected(item)}
              item={item}
            >
              {formatItem(item)}
            </Item>
          ))}
        </div>
      )}
    </div>
  );
};

Geocoder.propTypes = {
  timeout: PropTypes.number,
  queryParams: PropTypes.object,
  viewport: PropTypes.object.isRequired,
  onSelected: PropTypes.func.isRequired,
  transitionDuration: PropTypes.number,
  hideOnSelect: PropTypes.bool,
  pointZoom: PropTypes.number,
  mapboxApiAccessToken: PropTypes.string.isRequired,
  formatItem: PropTypes.func,
  className: PropTypes.string,
  inputComponent: PropTypes.func,
  itemComponent: PropTypes.func,
  limit: PropTypes.number,
  localGeocoder: PropTypes.func,
  localOnly: PropTypes.bool,
  updateInputOnSelect: PropTypes.bool,
  initialInputValue: PropTypes.string,
};

Geocoder.defaultProps = {
  timeout: 300,
  transitionDuration: 0,
  hideOnSelect: false,
  updateInputOnSelect: false,
  pointZoom: 16,
  formatItem: (item) => item.place_name,
  queryParams: {},
  className: "",
  limit: 5,
  initialInputValue: "",
};

export default Geocoder;
