/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

const AccessoriesComponent = ({
  setAccessoryIds,
  activityDetails,
  setTotalPrice,
  setDiscountedAmount,
  setTotalAcc,
}) => {
  const accessories = activityDetails?.Item_Accessories;

  const [selectedAccessories, setSelectedAccessories] = useState([]);

  // Initialize accessories when data is available
  useEffect(() => {
    if (accessories?.length > 0) {
      setSelectedAccessories(
        accessories?.map((acc) => ({
          ...acc,
          quantity: 0, // Default quantity is 0
          total_price: 0, // Default total price is 0
        }))
      );
    }
  }, [accessories]);

  const handleQuantityChange = (id, type, e) => {
    e.preventDefault();
    setDiscountedAmount(0);

    let prevTotalAccessoryPrice = selectedAccessories.reduce(
      (sum, item) => sum + item.total_price,
      0
    );

    const updatedAccessories = selectedAccessories.map((item) =>
      item.item_accessory_id === id
        ? {
            ...item,
            quantity:
              type === "increment"
                ? item.quantity + 1
                : Math.max(0, item.quantity - 1), // Ensure quantity doesn't go below 0
            total_price:
              type === "increment"
                ? (item.quantity + 1) * item.price
                : Math.max(0, item.quantity - 1) * item.price,
          }
        : item
    );

    setSelectedAccessories(updatedAccessories);

    // Automatically update accessory IDs when quantity changes
    const payload = updatedAccessories
      .filter((item) => item.quantity > 0)
      .map(({ item_accessory_id, quantity, total_price }) => ({
        item_accessory_id,
        quantity,
        total_price: parseFloat(total_price?.toFixed(2)),
      }));

    setAccessoryIds(payload);

    let newTotalAccessoryPrice = payload.reduce(
      (sum, item) => sum + item.total_price,
      0
    );

    setTotalAcc(newTotalAccessoryPrice);

    // Update total price correctly by removing the old total and adding the new one
    setTotalPrice(
      (prev) => prev - prevTotalAccessoryPrice + newTotalAccessoryPrice
    );
  };

  return (
    <div className="accessories-container">
      <h2>Additional Options</h2>
      {selectedAccessories.map((acc) => (
        <div key={acc.item_accessory_id} className="accessory-item">
          <div className="details">
            <h4>{acc.name}</h4>
            {/* {acc.notes && <p>{acc.notes}</p>} */}
          </div>

          <div className="quantity-control">
            <button
              onClick={(e) =>
                handleQuantityChange(acc.item_accessory_id, "decrement", e)
              }
            >
              -
            </button>
            <span>{acc.quantity}</span>
            <button
              onClick={(e) =>
                handleQuantityChange(acc.item_accessory_id, "increment", e)
              }
            >
              +
            </button>
          </div>

          <div className="price-info">
            <p>
              <span>1 {acc.name}:</span> ${acc.price.toFixed(2)}
            </p>
            <p>
              <span>Total:</span> ${acc.total_price.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccessoriesComponent;
