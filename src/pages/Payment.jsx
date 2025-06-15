import React from 'react';
import { useState } from 'react';



function Payment() {
const [selectedMethod, setSelectedMethod] = useState('Card');
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl border rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center">Subscribe to Premium</h2>
        <div className="text-center">
          <span className="text-5xl font-bold text-black">$5</span>
          <span className="text-gray-600"> / month</span>
          <p className="mt-2 font-semibold">Premium billed monthly</p>
        </div>
        <hr />
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>$5.00</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total due today</span>
          <span>$5.00</span>
        </div>
        <hr />

        <div className="grid grid-cols-3 gap-2 mt-6">
        <button
            type="button"
            onClick={() => setSelectedMethod('Card')}
            className={`p-3 rounded border ${
            selectedMethod === 'Card' ? 'border-blue-500 text-blue-600 font-medium' : 'border-gray-300 text-gray-500'
            }`}
        >
            Card
        </button>
        <button
            type="button"
            onClick={() => setSelectedMethod('ApplePay')}
            className={`p-3 rounded border ${
            selectedMethod === 'ApplePay' ? 'border-blue-500 text-blue-600 font-medium' : 'border-gray-300 text-gray-500'
            }`}
        >
            Apple Pay
        </button>
        <button
            type="button"
            onClick={() => setSelectedMethod('Paynow')}
            className={`p-3 rounded border ${
            selectedMethod === 'Paynow' ? 'border-blue-500 text-blue-600 font-medium' : 'border-gray-300 text-gray-500'
            }`}
        >
            Paynow
        </button>
        </div>

        <input type="text" placeholder="Card number" className="w-full border p-3 rounded mt-2" />
        <div className="flex gap-2">
          <input type="text" placeholder="MM / YY" className="w-1/2 border p-3 rounded" />
          <input type="text" placeholder="CVC" className="w-1/2 border p-3 rounded" />
        </div>
        <div className="flex gap-2">
          <select className="w-1/2 border p-3 rounded">
            <option>United States</option>
            <option>Singapore</option>
            <option>Indonesia</option>
          </select>
          <input type="text" placeholder="Postal Code" className="w-1/2 border p-3 rounded" />
        </div>

        <button className="bg-yellow-500 text-white font-semibold w-full py-3 rounded hover:bg-yellow-600 mt-4">
          Subscribe
        </button>
      </div>
    </div>
  );
}

export default Payment;
