import { useState } from 'react';

function FAQ() {
  const faqs = [
    {
      question: 'How do I scan a rock?',
      answer: 'Open the Scan tab and point your camera at the rock.'
    },
    {
      question: 'How do I save a rock scan?',
      answer: 'After scanning, click the save icon to store your result.'
    },
    {
      question: 'How do I upgrade my account?',
      answer: 'Go to your profile settings and choose a premium plan.'
    },
    {
      question: 'How do I earn points?',
      answer: 'You earn points by scanning rocks, completing quizzes, and sharing your results.'
    },
    {
      question: 'How many free scans do I get?',
      answer: 'Each user gets 5 free scans per month on the free plan.'
    },
    {
      question: 'What if no rock information is found?',
      answer: 'You can retake the scan or submit the image for expert review.'
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left side heading */}
          <div className="flex items-start">
            <h2 className="text-6xl font-bold text-black leading-tight">Frequently<br />Asked<br />Questions</h2>
          </div>

          {/* Right side FAQ list */}
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-medium text-lg">{faq.question}</span>
                  <span className="text-2xl font-bold">{openIndex === index ? '−' : '+'}</span>
                </div>
                {openIndex === index && (
                  <div className="text-gray-700 mt-2 ml-2">A: {faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-10 px-6 mt-auto">
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

export default FAQ;
