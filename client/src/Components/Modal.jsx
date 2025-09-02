import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IoMdClose } from "react-icons/io";

const Modal = ({ isOpen, onClose, title, content }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay with blur only, no black tint */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-md" />
        </Transition.Child>

        {/* Modal panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-[#FAFAFA] text-[#2D242B] p-6 rounded-lg shadow-xl border border-[#FAFAFA]">
              <Dialog.Title className="text-xl font-semibold mb-3">
                {title}
              </Dialog.Title>
              <div className="text-sm text-[#2D242B] space-y-2">{content}</div>

              <div className="mt-6 text-right">
                <button
                  onClick={onClose}
                  className="bg-[#0077C0] text-white p-2 rounded hover:bg-red-600 transition"
                  aria-label="Close modal"
                >
                  <IoMdClose size={24} />
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
