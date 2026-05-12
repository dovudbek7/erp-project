import useLots from "../hooks/useLots";
export const InvoicesList = () => {
  const { data, error, isLoading } = useLots();

  console.log(data);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;
  return (
    <div>
      {data?.map((inv) => (
        <div key={inv.id}>{inv.id}</div>
      ))}
    </div>
  );
};
