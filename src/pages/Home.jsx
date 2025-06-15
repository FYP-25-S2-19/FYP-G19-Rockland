import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    const handleRegisterClick = () => {
    navigate('/register');
    };

    const handleSubscribeClick = () => {
    navigate('/payment');
    };
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-green-700 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">#1 Rock Learning Platform<br />Explore the World of Rocks</h1>
            <p className="mb-6 text-lg">Rockland is the best rock identifier and education tool you need.</p>
            <div className="flex gap-4">
              <button
                onClick={handleRegisterClick}
                className="bg-white text-green-700 px-6 py-2 font-semibold rounded hover:bg-gray-100"
                >
                Register Free
                </button>
              <button className="border border-white px-6 py-2 rounded">App Demo</button>
            </div>
            <div className="flex gap-4 mt-4">
            <img src="/img/appstore.png" className="w-[140px] h-auto" />
            <img src="/img/googleplay.png" className="w-[140px] h-auto" />
            </div>
        </div>
          <img src="/img/phone-preview.png" alt="App preview" className="w-64 h-auto" />
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-right mb-10">Rockland Special Features</h2>
          <div className="flex flex-col items-center">
            <img src="/img/feature-diagram.png" alt="Feature Diagram" className="max-w-md md:max-w-2xl w-full h-auto mb-10" />
            {/* You can use absolutely positioned divs for the bubbles if you wish */}
          </div>
        </div>
      </section>

      {/* App Demo Section */}
      <section className="py-20 px-6 bg-gray-100 text-center">
        <h2 className="text-xl font-semibold mb-4">App Demo</h2>
        <p className="mb-6 text-sm">Learn how to use the Rockland App</p>
        <div className="w-full max-w-xl mx-auto">
          <div className="aspect-w-16 aspect-h-9 bg-gray-300 flex items-center justify-center">
            <span className="text-2xl">▶</span>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="bg-green-600 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-10">Our Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white text-black p-4 rounded shadow">Article 1</div>
            <div className="bg-white text-black p-4 rounded shadow">Article 2</div>
            <div className="bg-white text-black p-4 rounded shadow">Article 3</div>
          </div>
        </div>
      </section>

      {/* Pricing Overview Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-10">Subscription Plan</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-10">
            <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-sm text-center">
              <h3 className="text-sm font-bold tracking-widest mb-2">BASIC</h3>
              <div className="text-5xl font-bold">$0<span className="text-base font-normal">/mo</span></div>
              <ul className="text-gray-700 my-6 space-y-3 text-left pl-6">
                <li>✅ Unlimited Team Members</li>
                <li>✅ Unlimited Team Members</li>
              </ul>
              <button
            onClick={handleRegisterClick}
            className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
            >
            Register Free Now!
            </button>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-sm text-center">
              <h3 className="text-sm font-bold tracking-widest text-green-700 mb-2">PREMIUM</h3>
              <div className="text-5xl font-bold">$5<span className="text-base font-normal">/mo</span></div>
              <ul className="text-gray-700 my-6 space-y-3 text-left pl-6">
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
      </section>

      {/* QR Download Section */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-xl font-semibold mb-6">Download Rockland and Start Exploring Now!</h2>
        <div className="flex justify-center items-center gap-10">
          <img src="/img/qr.png" alt="QR Code" className="h-32" />
          <img src="/img/phone-download.png" alt="Phone Image" className="h-32" />
        </div>
        <div className="mt-4">
          <img src="/img/appstore-googleplay.png" alt="Stores" className="h-10 mx-auto" />
        </div>
      </section>

      {/* FAQ Summary */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex items-start">
            <h2 className="text-4xl font-bold text-black leading-tight">Frequently<br />asked<br />questions</h2>
          </div>
          <div className="space-y-6">
            {["How do I scan a rock?", "How do I save a rock scan?", "How do I upgrade my account?", "How do I earn points?", "How many free scans do I get?", "What if no rock information is found?"]
              .map((q, i) => (
                <div key={i} className="flex justify-between items-center border-b pb-2">
                  <span>{q}</span>
                  <span className="text-xl font-bold">+</span>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-10 px-6">
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

export default Home;
