type Destination = {
  name: string;
  className: string;
};

const destinations: Destination[] = [
  { name: "UK", className: "destination-uk" },
  { name: "USA", className: "destination-usa" },
  { name: "CANADA", className: "destination-canada" },
  { name: "MALAYSIA", className: "destination-malaysia" },
  { name: "JAPAN", className: "destination-japan" },
  { name: "AUSTRALIA", className: "destination-australia" },
];

export default function DestinationsSection() {
  return (
    <section id="destinations" className="scroll-mt-28 px-8 py-24">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="mb-16 text-center text-[3.5rem] font-extrabold leading-tight tracking-[-0.03em] text-slate-900">
          Explore destinations for studying abroad
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {destinations.map((destination) => (
            <div
              key={destination.name}
              className={`destination-card ${destination.className}`}
            >
              <div className="destination-overlay" />
              <div className="destination-label">{destination.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}