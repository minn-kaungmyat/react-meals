import React, { useContext, useState } from "react";

import Modal from "../UI/Modal";
import CartItem from "./CartItem";
import classes from "./Cart.module.css";
import CartContext from "../../store/cart-context";
import Checkout from "./Checkout";

const Cart = (props) => {
  const cartCtx = useContext(CartContext);
  const [isCheckout, setIsCheckOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const [error, setError] = useState(null);

  const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;
  const hasItems = cartCtx.items.length > 0;
  const cartIsEmpty = cartCtx.items.length === 0;

  const cartItemRemoveHandler = (id) => {
    cartCtx.removeItem(id);
  };

  const cartItemAddHandler = (item) => {
    cartCtx.addItem({ ...item, amount: 1 });
  };

  const orderHandler = () => {
    setIsCheckOut(true);
  };

  const submitHandler = async (userData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        "https://react-http-cd08a-default-rtdb.firebaseio.com/orders.json",
        {
          method: "POST",
          body: JSON.stringify({
            user: userData,
            orderItems: cartCtx.items,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Something went wrong!");
      }
      setIsSubmitting(false);
      setDidSubmit(true);
      cartCtx.clearCart();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartItems = (
    <ul className={classes["cart-items"]}>
      {cartCtx.items.map((item) => (
        <CartItem
          key={item.id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
        />
      ))}
    </ul>
  );

  const modalActions = (
    <div className={classes.actions}>
      <button className={classes["button--alt"]} onClick={props.onClose}>
        Close
      </button>
      {hasItems && (
        <button className={classes.button} onClick={orderHandler}>
          Order
        </button>
      )}
    </div>
  );

  const cartModalContent = (
    <React.Fragment>
      {cartItems}
      <div className={classes.total}>
        <span>Total Amount:</span>
        <span>Total Amount:</span>
        <span>{totalAmount}</span>
      </div>
      {isCheckout && hasItems && (
        <Checkout onCancel={props.onClose} onSubmit={submitHandler} />
      )}
    </React.Fragment>
  );

  const isSubmittingModalContent = <p>Sending order...</p>;
  const isSubmittedModalContent = <p>Order Successful!</p>;

  return (
    <Modal onClose={props.onClose}>
      {!isSubmitting && !didSubmit && cartModalContent}
      {isSubmitting && isSubmittingModalContent}
      {!isSubmitting && didSubmit && isSubmittedModalContent}
      {error && !didSubmit && !isSubmitting && !cartIsEmpty && (
        <p className={classes.error}>{error}</p>
      )}
      {(!isCheckout || !hasItems) && modalActions}
    </Modal>
  );
};

export default Cart;
