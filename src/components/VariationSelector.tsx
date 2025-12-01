import React, { useState, useEffect } from "react";

export default function VariationSelector({ attributes, variations, onChange }) {
  const [selected, setSelected] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});

const colorAliases = {
  // BLUE SHADES
  "navy": "#001f3f",
  "navy blue": "#001f3f",
  "dark navy": "#001f3f",

  "sky blue": "#87ceeb",
  "light blue": "#add8e6",
  "baby blue": "#89cff0",

  "blue": "blue",

  // BLACK & WHITE
  "black": "#000000",
  "jet black": "#000000",
  "matte black": "#1c1c1c",

  "white": "#ffffff",
  "off white": "#f8f8f8",
  "cream": "#fffdd0",

  // RED SHADES
  "red": "#ff0000",
  "maroon": "#800000",
  "burgundy": "#800020",

  // GREEN SHADES
  "green": "green",
  "mint": "#98ff98",
  "olive": "#808000",

  // GRAY SHADES
  "gray": "#808080",
  "grey": "#808080",
  "light gray": "#d3d3d3",
  "dark gray": "#404040",
};

const normalizeColor = (name) => {
  const n = name.toLowerCase().trim();
  return colorAliases[n] || name;
};


  // Compute available options dynamically
  const computeAvailableOptions = (variations, selectedAttrs) => {
    const available = {};
    if (!variations || variations.length === 0) return available;

    const attrKeys = Object.keys(variations[0].attributes).map(k =>
      k.replace(/^pa_/, "")
    );

    attrKeys.forEach(attrKey => {
      const options = variations
        .filter(v =>
          Object.entries(selectedAttrs).every(([key, value]) => {
            if (key.toLowerCase() === attrKey.toLowerCase()) return true; // skip current attr
            const wcKey = `pa_${key.toLowerCase()}`;
            return v.attributes[wcKey]?.toLowerCase() === value.toLowerCase();
          })
        )
        .map(v => v.attributes[`pa_${attrKey.toLowerCase()}`]);

      available[attrKey] = [...new Set(options)];
    });

    return available;
  };

  // Update available options when selection changes
  useEffect(() => {
    setAvailableOptions(computeAvailableOptions(variations, selected));
  }, [selected, variations]);

  const handleSelect = (attrName, option) => {
    const updated = { ...selected, [attrName]: option };
    setSelected(updated);
    onChange && onChange(updated);
  };

return (
  <div style={{ display: "grid", gap: "2rem" }}>
    {attributes.map((attr, index) => {
      const isColor = attr.name.toLowerCase() === "color";

      return (
        <div key={index}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>{attr.name}</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {attr.options.map((option, i) => {
              const isActive = selected[attr.name] === option;
              const isAvailable =
                availableOptions[attr.name]?.includes(option) ?? true;

              // If it's COLOR, render swatches
                if (isColor) {
                  return (
                    <div
                      key={i}
                      onClick={() => isAvailable && handleSelect(attr.name, option)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: normalizeColor(option),
                        border: isActive
                          ? "3px solid #007bff"
                          : "2px solid #ccc",
                        opacity: isAvailable ? 1 : 0.4,
                        cursor: isAvailable ? "pointer" : "not-allowed",
                      }}
                      title={option} // tooltip shows the actual option name
                    />
                  );
                }


              // Default BUTTON UI for non-color attributes
              return (
                <button
                  key={i}
                  onClick={() => isAvailable && handleSelect(attr.name, option)}
                  disabled={!isAvailable}
                  style={{
                    padding: "8px 15px",
                    borderRadius: "8px",
                    border: "2px solid",
                    borderColor: isActive ? "#007bff" : "#ccc",
                    backgroundColor: isActive
                      ? "#e6f0ff"
                      : isAvailable
                      ? "white"
                      : "#f5f5f5",
                    cursor: isAvailable ? "pointer" : "not-allowed",
                    color: isAvailable ? "#000" : "#888",
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

}
