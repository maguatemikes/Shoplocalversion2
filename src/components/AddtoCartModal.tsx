import { motion, AnimatePresence } from "motion/react";
import { CheckCircle } from "lucide-react";

interface AddToCartModalProps {
  show: boolean;
  onClose: () => void;
  productName: string;
  productImage?: string;
}

export default function AddToCartModal({
  show,
  onClose,
  productName,
  productImage,
}: AddToCartModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md mx-4 text-center"
          >
            <CheckCircle className="mx-auto text-green-500 w-16 h-16" />

            <h2 className="text-xl font-semibold mt-4">Added to Cart!</h2>

            <p className="text-gray-600 mt-1">{productName}</p>

            {productImage && (
              <img
                src={productImage}
                alt={productName}
                className="w-24 h-24 object-cover rounded-lg mx-auto mt-4"
              />
            )}

            <button
              className="mt-6 w-full py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
