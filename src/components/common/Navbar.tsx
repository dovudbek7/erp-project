import LangSelect from "./LangSelect";

const Navbar = () => {
  return (
    <div className="border-b-2 border-border p-4 flex justify-between px-[50px] items-center bg-white">
      <p className="text-black">Content Area</p>
      <LangSelect />
    </div>
  );
};

export default Navbar;
