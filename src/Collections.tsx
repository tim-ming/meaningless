const Collections = () => {
  const collections = [
    "Twisted Dragon",
    "Celestial Haven",
    "Guardian of the Abyss",
    "Warrior of the Nebula",
    "Twisted Dragon",
    "Celestial Haven",
    "Guardian of the Abyss",
    "Warrior of the Nebula",
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-1/4 p-8 bg-white border-r border-gray-300">
        <h1 className="text-3xl font-bold mb-8">Collections</h1>
        <ul className="space-y-4">
          {collections.map((item, index) => (
            <li key={index} className="text-lg hover:underline">
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="w-3/4 p-8">
        {/* First Collection */}
        <section className="mb-16">
          <header className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold">Twisted Dragon</h2>
            <span className="text-xl font-semibold text-gray-400">01</span>
          </header>
          <div className="flex space-x-8">
            <p className="w-1/2 text-sm text-gray-700">
              AI-generated images often lack emotions because they are created
              using mathematical algorithms and neural networks, which interpret
              visual elements as data points rather than emotional expressions.
            </p>
            <p className="w-1/2 text-sm text-gray-700">
              While advanced AI models can mimic facial expressions, colors, and
              compositions associated with emotions, they do not truly feel or
              understand the emotions they attempt to replicate.
            </p>
          </div>
          <div className="mt-8">
            <img
              src="https://via.placeholder.com/800x600"
              alt="Twisted Dragon"
              className="w-full object-cover rounded-lg shadow"
            />
          </div>
          <footer className="text-right text-gray-400 text-lg mt-2">01</footer>
        </section>

        {/* Duplicate Section */}
        <section>
          <header className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold">Twisted Dragon</h2>
            <span className="text-xl font-semibold text-gray-400">01</span>
          </header>
          <div className="flex space-x-8">
            <p className="w-1/2 text-sm text-gray-700">
              AI-generated images often lack emotions because they are created
              using mathematical algorithms and neural networks, which interpret
              visual elements as data points rather than emotional expressions.
            </p>
            <p className="w-1/2 text-sm text-gray-700">
              While advanced AI models can mimic facial expressions, colors, and
              compositions associated with emotions, they do not truly feel or
              understand the emotions they attempt to replicate.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Collections;
