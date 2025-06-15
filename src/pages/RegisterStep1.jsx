import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function RegisterStep1() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/register/step2');
  };

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
        <form onSubmit={handleNext} className="p-10 md:w-1/2">
          <h2 className="text-2xl font-bold text-center mb-6">Step 1: Account Setup</h2>

          <input className="w-full border p-3 rounded mb-4" type="text" placeholder="First Name" required />
          <input className="w-full border p-3 rounded mb-4" type="text" placeholder="Last Name" required />
          <input className="w-full border p-3 rounded mb-4" type="email" placeholder="Email" required />

          {/* Create Password */}
          <div className="relative mb-4">
            <input
              className="w-full border p-3 rounded pr-10"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-sm text-gray-600"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative mb-6">
            <input
              className="w-full border p-3 rounded pr-10"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute top-3 right-3 text-sm text-gray-600"
            >
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 mt-4">
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterStep1;
