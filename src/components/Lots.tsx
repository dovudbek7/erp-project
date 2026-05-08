const data = [
  {
    id: 1,
    lotNumber: "LAMB-2026-05-001",
    product: "PORK-SHOULDER",
    warehouse: "Cold Storage A (CS-A)",
    status: "AVAILABLE",
    currentQTY: "80",
    unitCost: 65_000,
    expirey: "10",
  },
];

function Lots() {
  return (
    <>
      <div className="">
        <h1 className="text-2xl font-bold mb-4">Lots</h1>
        <p className="text-gray-600">This is the Lots page.</p>
      </div>
    </>
  );
}

export default Lots;
