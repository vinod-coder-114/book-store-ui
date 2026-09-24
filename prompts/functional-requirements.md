## Cart Component - Functional Requirements
1. Add a Book to Cart.
    Book Card
   │
   └── Add to Cart
          ↓
      CartService
          ↓
       Cart items
    - If the same book added multiple times, then
        First click  → quantity = 1
        click → quantity = 2
        Third click  → quantity = 3
    NOTE: Don't create three separate cart rows for the same book.

2. Display Cart Items.
    Each cart item should show:
    - Book Cover
    - Book title
    - Author
    - Format/category
    - Unit Price
    - Original Price
    - Quantity
    - Total price of that item
    - Remove Button
    - Wishlist/move to wishlist - optional

3. Increase Quantity
    - when user clicks on + button, cart will increase the item count.
    - Don't allow the user to add books exceed the available stock.
    - If stock exceed, + button should be disabled.

4. Decrease Quantity
    - Click - button should decrease the item quantity.
    - When Quantity reaches 1, then disble the - button.

5. Remove Item
    - Clicking Remove removes the entire Item.

6. Cart Totals
    - The Cart should calculate
        Subtotal
        Discount
        Delivery
        ----------------
        Total
    - Example 
        Cart Summary

        Subtotal                 ₹2,897
        Discount                 -₹300
        Delivery                  ₹50
        -----------------------------
        Total                    ₹2,647

        [ Proceed to Checkout ]

    - Initially, you can keep the calculation simple:
        Subtotal = Σ(unitPrice × quantity)
    
7. Empty Cart
    - If there is no Item, doesn't show an empty table.
     show something like
                   
                   🛒

          Your Cart is Empty

          Looks like you haven't added
           anything to your cart yet.

                [ Browse Books ]

