import "./App.css";
import { StaticMap } from "react-map-gl";
import { useState } from "react";
import { DeckGL } from "@deck.gl/react";
import Geocoder from "./Geocoder";

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const initialViewState = {
  longitude: -73.645,
  latitude: 45.56,
  zoom: 11,
  pitch: 0,
  bearing: -57.2,
};

const params = {
  country: "ca",
};

const mapStyle = "mapbox://styles/mapbox/light-v10";

function App() {
  const [viewState, setViewState] = useState(initialViewState);

  const handleChangeViewState = ({ viewState }) => setViewState(viewState);

  const handleSelect = (value) => {
    setViewState(value);
  };
  return (
    <>
      <DeckGL
        viewState={viewState}
        onViewStateChange={handleChangeViewState}
        controller={true}
      >
        <StaticMap
          mapStyle={mapStyle}
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          width={"100vw"}
          height={"100vh"}
        />
      </DeckGL>
      <div style={{ zIndex: 10, position: "absolute", top: 0, left: 0 }}>
        <Geocoder
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
          onSelected={handleSelect}
          viewport={viewState}
          hideOnSelect={true}
          value=""
          queryParams={params}
          updateInputOnSelect={true}
        />
      </div>
    </>
  );
}

export default App;
