import React, { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";
import "./PriceRangeSlider.css";

const STEP = 500000;
const MIN = 0;
const MAX = 60000000;

export default function PriceRangeSlider({ onChange, value }) {
  // support controlled usage via `value` prop, fallback to internal default
  const initial = Array.isArray(value) && value.length === 2 ? value : [10000000, 30000000];
  const [values, setValues] = useState(initial);

  // sync when parent-controlled value changes
  useEffect(() => {
    if (Array.isArray(value) && value.length === 2) setValues(value.map(v => Number(v || 0)));
  }, [value]);

  const handleChange = (vals) => {
    setValues(vals);
    onChange && onChange(vals);
  };

  return (
    <div className="price-slider">
      <div className="labels">
        <span>{values[0].toLocaleString()}₫</span>
        <span>{values[1].toLocaleString()}₫</span>
      </div>

      <Range
        step={STEP}
        min={MIN}
        max={MAX}
        values={values}
        onChange={handleChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="track"
            style={{
              background: getTrackBackground({
                values,
                colors: ["#e5e5e5", "#ff4444", "#e5e5e5"],
                min: MIN,
                max: MAX,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div {...props} className="thumb" />
        )}
      />
    </div>
  );
}
