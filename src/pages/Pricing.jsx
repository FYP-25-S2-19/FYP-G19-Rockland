import { useNavigate } from 'react-router-dom';

function Pricing() {
  const navigate = useNavigate();

  const handleFreeRegister = () => {
  navigate('/register'); // or '/register/step1' if that’s your actual route
  };

  const handleSubscribeClick = () => {
  navigate('/payment');
  };
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <div className="py-16 px-6">
        <h2 className="text-4xl font-bold text-center text-green-700 mb-12">Subscription Plan</h2>

        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          {/* Basic Plan */}
          <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-md text-center">
            <h3 className="text-sm font-bold tracking-widest mb-2">BASIC</h3>
            <div className="text-5xl font-bold">$0<span className="text-base font-normal">/mo</span></div>

            <ul className="text-gray-700 my-6 space-y-3 text-lg text-left pl-6">
              <li>✅ Unlimited Team Members</li>
              <li>✅ Unlimited Team Members</li>
              <li>✅ Unlimited Team Members</li>
              <li>✅ Unlimited Team Members</li>
            </ul>

            <button
            onClick={handleFreeRegister}
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
            >
            Register Free Now!
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-md text-center">
            <h3 className="text-sm font-bold tracking-widest text-green-700 mb-2">PREMIUM</h3>
            <div className="text-5xl font-bold">$5<span className="text-base font-normal">/mo</span></div>

            <ul className="text-gray-700 my-6 space-y-3 text-lg text-left pl-6">
              <li>✅ Unlimited Team Members</li>
              <li>✅ Unlimited Team Members</li>
              <li>✅ Unlimited Team Members</li>
              <li>✅ Unlimited Team Members</li>
            </ul>

            <button
            onClick={handleSubscribeClick}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
            Subscribe Now!
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-10 px-6 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-2">Rockland</h4>
            <p className="text-sm">The number #1 rock learning application with gamify features</p>
            <p className="text-sm mt-4">2025 Rockland FYP-S2-G19</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">About</h4>
            <ul className="space-y-1 text-sm">
              <li>Features</li>
              <li>Partnership</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Community</h4>
            <ul className="space-y-1 text-sm">
              <li>Events</li>
              <li>Blog</li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-center mt-8 border-t border-white pt-4">
          <span className="mr-4">Privacy & Policy</span>
          <span>Terms & Conditions</span>
        </div>
      </footer>
    </div>
  );
}

export default Pricing;
