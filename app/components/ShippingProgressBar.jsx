import {Money} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';

const ShippingProgressBar = ({totalAmount}) => {
  const minimumAmount = 100;
  const [amountAway, setAmountAway] = useState(minimumAmount);
  // Total amount from Cart
  const totalSpentAmount = totalAmount;
  const [remainingPercent, setRemainingPercent] = useState(0);
  // Calculate remaining to qualify for Free Shipping
  useEffect(() => {
    setAmountAway(Number(minimumAmount) - Number(totalSpentAmount.amount));
  }, [totalSpentAmount]);

  useEffect(() => {
    setRemainingPercent(
      (Number(totalSpentAmount.amount) / minimumAmount) * 100,
    );
  }, [amountAway]);
  return (
    <div className="bg-slate-200 px-4 py-4 text-center">
      <p>SUMMARY</p>
      {minimumAmount > totalSpentAmount.amount ? (
        <>
          <p>Free Standard Shipping</p>
          <div>
            <span>You're</span>
            <Money
              data={{
                amount: amountAway > 0 ? amountAway.toString() : '0',
                currencyCode: totalAmount.currencyCode.toString(),
              }}
            />
            <span>away from Free Express Shipping</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark-bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{
                  width: `${
                    remainingPercent > 100 ? minimumAmount : remainingPercent
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p>Free Express Shipping</p>
        </>
      )}
    </div>
  );
};
export default ShippingProgressBar;
