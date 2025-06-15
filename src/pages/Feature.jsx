function Feature() {
  return (
    <div className="bg-green-600 text-white min-h-screen">
      {/* Features Section */}
      <div className="bg-white text-black py-12">
        <h2 className="text-4xl font-bold text-center mb-12">EXPLORE ROCKLAND FEATURES</h2>

        <div className="flex justify-center items-center relative max-w-8xl mx-auto">
          <img src="/img/feature-diagram.png" alt="App preview" className="w-100 h-auto" />
        </div>
      </div>

      {/* Article Previews */}
      <div className="bg-green-500 py-10 px-6">
        <h3 className="text-2xl font-semibold text-center mb-6 text-white">Our Articles</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="bg-white border rounded shadow p-4">
              <img
                src="https://via.placeholder.com/300x160"
                alt="Article preview"
                className="rounded mb-3"
              />
              <p className="font-bold mb-2">What are the type of geologics rocks?</p>
              <p className="text-sm text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque luctus...
              </p>
              <button className="text-green-600 mt-3 text-sm hover:underline">
                Sign Up Now to Read Full Articles
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold text-lg">Rockland</h4>
            <p className="text-sm mt-2">The number #1 rock learning application with gamify features</p>
            <p className="text-xs mt-4">2025 Rockland FYP-S2-G19</p>
          </div>
          <div>
            <h5 className="font-bold mb-2">About</h5>
            <ul className="text-sm space-y-1">
              <li>Features</li>
              <li>Partnership</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-2">Community</h5>
            <ul className="text-sm space-y-1">
              <li>Events</li>
              <li>Blog</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs mt-6 border-t border-white pt-4">
          Privacy & Policy | Terms & Conditions
        </div>
      </footer>
    </div>
  );
}

export default Feature;
