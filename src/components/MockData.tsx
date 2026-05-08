import { useState, useEffect } from "react";
import type { Lot } from "../types";
export const InvoicesList = () => {
  const [invoices, setInvoices] = useState<Lot[]>([]);

  useEffect(() => {
    fetch("/api/lots")
      .then((res) => res.json())
      .then((data: Lot[]) => {
        setInvoices(data);
        console.log(invoices);
      });
  }, []);

  return (
    <div>
      {invoices.map((inv) => (
        <div key={inv.id}>{inv.id}</div>
      ))}
    </div>
  );
};
