import Tooltip from "../../../../Components/Tooltip";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProgressBarCard from "../ProgressBarCard";
import { IoMdInformationCircleOutline } from "react-icons/io";

const data = {
  invoices: {
    current: 1130000,
    overdue: 204050,
  },
};

function ReceivableCard() {
  const navigate = useNavigate();
  // const [isOpen, setIsOpen] = useState(false);
  // const dropdownRef = useRef(null);

  // // const toggleDropdown = () => {
  // //   setIsOpen(!isOpen);
  // // };

  // // Closes the dropdown when clicking outside of it
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setIsOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  const handleNavigation = (path) => {
    navigate(path);
    // setIsOpen(false);
  };

  return (
    <div className="bg-white flex-1 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center w-full p-4 border-b bg-white rounded-t-lg relative gap-x-1 md:gap-x-2 md:p-4 z-10">
        <h4 className="text-base md:text-lg font-medium text-gray-700">
          Total Receivable
        </h4>
        <Tooltip
          tooltip="Current and overdue amount that you're yet to receive from customers"
          position="bottom"
        >
          <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
        </Tooltip>
      </div>

      {/* <div ref={dropdownRef} className="relative cursor-pointer">
          <FaPlusCircle className="text-primary" onClick={toggleDropdown} />
          {isOpen && (
            <div className="absolute top-full p-2 left-[10px] mt-2 w-48 bg-white shadow-lg rounded-xl z-10 border border-gray-200">
              <div
                className="flex items-center gap-4 px-4 py-2 hover:bg-primary cursor-pointer hover:rounded-xl hover:text-white"
                onClick={() => handleNavigation("/Invoice")}
              >
                <FaPlusCircle className="bg-primary rounded-lg border-none text-white" />
                <p>New Invoice</p>
              </div>
            </div>
          )}
        </div> */}

      <div className="flex items-center py-2">
        <div className="py-2 pr:4 md:pl-10 md:pr-4">
          <ProgressBarCard
            current={data.invoices.current}
            overdue={data.invoices.overdue}
          />
        </div>

        <div className="border-l border-gray-300 mx-6 h-[120px] hidden sm:block"></div>

        <div className="flex flex-col gap-y-2 md:gap-y-4 justify-center w-full px-4">
          <button
            onClick={() => handleNavigation("/Invoice/NewInvoice")}
            className="flex items-center gap-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 shadow-md w-[140px] ml-auto"
          >
            <FaPlusCircle className="text-white" />
            <p className="text-sm">New Invoice</p>
          </button>

          <div className="grid grid-cols-[60%_40%] gap-x-4 mt-2">
            <div className="text-sm text-gray-600 text-left">
              8 Awaiting Payment
            </div>
            <div className="text-sm text-gray-600 text-left break-words">
              {data.invoices.current}
            </div>

            <div className="text-sm text-gray-600 text-left">5 Overdue</div>
            <div className="text-sm text-gray-600 text-left break-words">
              {data.invoices.overdue}
            </div>

            <div className="text-sm text-gray-600 text-left">
              Total Unpaid Invoices
            </div>
            <div className="text-sm text-gray-600 text-left break-words">
              {data.invoices.current + data.invoices.overdue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceivableCard;
