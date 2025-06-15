import { useState } from 'react';

function RegisterStep2() {
  return (
    <div className="min-h-screen bg-green-600 flex items-center justify-center px-4">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg w-[90%] md:w-[80%] overflow-hidden">
        {/* Left Side Image */}
        <div className="bg-green-600 p-8 flex flex-col items-center justify-center text-white md:w-1/2">
          <img
            src="/img/rock-scan.png"
            alt="Registration Visual"
            className="w-90 h-auto mb-6 rounded-[40px] shadow-md"
          />
          <h1 className="text-6xl font-extrabold tracking-wide">REGISTRATION</h1>
        </div>

        {/* Right Side Form */}
        <form className="p-10 md:w-1/2">
          <h2 className="text-2xl font-bold text-center mb-1">Step 2: Profiling</h2>
          <p className="text-center text-green-700 text-sm mb-6">Tell us about yourself</p>

          <input className="w-full border p-3 rounded mb-4" type="date" required />

          <select className="w-full border p-3 rounded mb-4" required>
            <option value="">Select Region</option>
            <option>Singapore</option>
            <option>Indonesia</option>
            <option>Malaysia</option>
          </select>

          <input
            className="w-full border p-3 rounded mb-4"
            type="text"
            placeholder="Interest (e.g. Fossils, Crystals)"
            required
          />

          <div className="mb-4">
            <label className="block mb-2 font-medium">What's your gender?</label>
            <div className="space-x-4">
              <label><input type="radio" name="gender" /> Female</label>
              <label><input type="radio" name="gender" /> Male</label>
              <label><input type="radio" name="gender" /> Rather not say</label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Select Plan</label>
            <div className="space-x-4">
              <label><input type="radio" name="plan" /> Free Plan</label>
              <label><input type="radio" name="plan" /> Premium Plan</label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 mt-4"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterStep2;
