import React, { useState, useEffect } from "react";

export default function VariationSelector({ attributes, variations, onChange }) {
  const [selected, setSelected] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});

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
      {attributes.map((attr, index) => (
        <div key={index}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>{attr.name}</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {attr.options.map((option, i) => {
              const isActive = selected[attr.name] === option;
              const isAvailable =
                availableOptions[attr.name]?.includes(option) ?? true;

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
      ))}
    </div>
  );
}
